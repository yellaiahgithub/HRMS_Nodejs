const {
  switchDB,
  getDBModel,
  resignationApprovalHistorySchema,
  resignationSchema,
  separationControlSchema,
  employeeSchema,
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");
const resignationUtils = require("../utils/resignationUtils");

class ResignationApprovalHistoryService {
  constructor() {}

  createResignationApprovalHistory = async (data, req, res) => {
    try {
      console.log("Data for resignationApprovalHistory create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationApprovalHistorySchema);
      const resignationApprovalHistoryModel = await getDBModel(
        DB,
        "resignationApprovalHistory"
      );
      data.uuid = uuidv4();
      let savedResignationApprovalHistory =
        await resignationApprovalHistoryModel.insertMany([data], {
          runValidators: true,
        });
      return savedResignationApprovalHistory;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateAndCreateNextHistory = async (data, req, res) => {
    try {
      console.log("Data for resignationApprovalHistory update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationApprovalHistorySchema);
      const resignationApprovalHistoryModel = await getDBModel(
        DB,
        "resignationApprovalHistory"
      );
      let updateInfo = {
        approvalStatus: data.approvalStatus,
        isActive: false,
        comments: data.comments,
        acceptanceCriteria: data.acceptanceCriteria,
        relievingDate:
          data.approvalStatus == "Approved" ? data.relievingDate : null,
        updatedAt: new Date(),
      };

      console.log("updateInfo", updateInfo);
      const savedResignationApprovalHistory =
        await resignationApprovalHistoryModel.findOneAndUpdate(
          { uuid: data.resignationHistoryUUID },
          { $set: updateInfo },
          { upsert: false }
        );

      // Resignation
      const rDB = await switchDB(companyName, resignationSchema);
      const resignationModel = await getDBModel(rDB, "resignation");
      const resignationData = await resignationModel
        .findOne({ uuid: data.resignationUUID })
        .lean();
      resignationUtils.sendMails(data,resignationData)
      if (data.approvalStatus == "Approved") {
        if (data.approver.toLowerCase() === "Admin".toLowerCase()) {
          const savedResignationApprovalHistory =
            await resignationApprovalHistoryModel.updateMany(
              { resignationUUID: data.resignationUUID, isActive: true },
              { $set: { isActive: false } },
              { upsert: false }
            );
          let resignationUpdated = {};
          resignationUpdated.lastWorkingDate = data.relievingDate;
          resignationUpdated.status = data.approvalStatus;
          await resignationModel.updateOne(
            { uuid: data.resignationUUID },
            { $set: resignationUpdated },
            { upsert: false }
          );
          await resignationUtils.updateTransactionSummary(
            resignationData,
            req,
            "Approved"
          );
        } else {
          const DB = await switchDB(companyName, separationControlSchema);
          const separationControlModel = await getDBModel(
            DB,
            "separationControl"
          );

          const separation = await separationControlModel.findOne().lean();

          const eDB = await switchDB(companyName, employeeSchema);
          const employeeModel = await getDBModel(eDB, "employee");

          let approvalPaths = [];
          approvalPaths = resignationUtils.getApproverCriteria(
            resignationData,
            separation.approvalPath
          );
          const currentApprovalPathObject = approvalPaths.findIndex(
            (l) =>
              l.level ===
              Number(savedResignationApprovalHistory.levelOfApprover)
          );
          let matchedObj = approvalPaths[currentApprovalPathObject + 1];
          if (matchedObj) {
            const resignationApprovalHistoryDataList = [];
            let reportingManager = await employeeModel
              .findOne(
                { uuid: resignationData.employeeUUID },
                { managerUUID: 1 }
              )
              .lean();
            if (
              matchedObj.approver.toLowerCase() ==
              "Reporting Manager".toLowerCase()
            ) {
              const historyObj =
                resignationUtils.generateResignationHistoryObject(
                  matchedObj,
                  reportingManager.managerUUID,
                  data.resignationUUID
                );
              resignationApprovalHistoryDataList.push(historyObj);
              await resignationUtils.updateTransactionSummary(
                resignationData,
                req,
                "Pending"
              );
            } else {
              if (
                matchedObj.approver.toLowerCase() == "L2 Manager".toLowerCase()
              ) {
                const l2reportingManager = await employeeModel
                  .findOne(
                    { uuid: reportingManager.managerUUID },
                    { managerUUID: 1 }
                  )
                  .lean();
                const historyObj =
                  resignationUtils.generateResignationHistoryObject(
                    matchedObj,
                    l2reportingManager.managerUUID,
                    data.resignationUUID
                  );
                resignationApprovalHistoryDataList.push(historyObj);
                await resignationUtils.updateTransactionSummary(
                  resignationData,
                  req,
                  "Pending"
                );
              } else if (
                matchedObj.approver.toLowerCase() == "L3 Manager".toLowerCase()
              ) {
                const l2reportingManager = await employeeModel
                  .findOne(
                    { uuid: reportingManager.managerUUID },
                    { managerUUID: 1 }
                  )
                  .lean();
                const l3reportingManager = await employeeModel
                  .findOne(
                    { uuid: l2reportingManager.managerUUID },
                    { managerUUID: 1 }
                  )
                  .lean();
                const historyObj =
                  resignationUtils.generateResignationHistoryObject(
                    matchedObj,
                    l3reportingManager.managerUUID,
                    data.resignationUUID
                  );
                resignationApprovalHistoryDataList.push(historyObj);
                await resignationUtils.updateTransactionSummary(
                  resignationData,
                  req,
                  "Pending"
                );
              } else if (
                matchedObj.approver.toLowerCase() == "ROLE".toLowerCase()
              ) {
                const roleEmployees = await employeeModel
                  .find({
                    roleUUIDs: matchedObj.approverRoleUUID,
                  })
                  .lean();
                roleEmployees.forEach((emp) => {
                  resignationApprovalHistoryDataList.push(
                    resignationUtils.generateResignationHistoryObject(
                      matchedObj,
                      emp.uuid,
                      data.resignationUUID
                    )
                  );
                });
                await resignationUtils.updateTransactionSummary(
                  resignationData,
                  req,
                  "Pending"
                );
              }
            }
            if(resignationApprovalHistoryDataList.length>0){
            const NewResignationApprovalHistory =
              await resignationApprovalHistoryModel.insertMany(
                resignationApprovalHistoryDataList,
                { runValidators: true }
              );
            }
          }
          else{
            let resignationUpdated = {};
            resignationUpdated.lastWorkingDate = data.relievingDate;
            resignationUpdated.status = data.approvalStatus;
            await resignationModel.updateOne(
              { uuid: data.resignationUUID },
              { $set: resignationUpdated },
              { upsert: false }
            );
            await resignationUtils.updateTransactionSummary(
              resignationData,
              req,
              "Approved"
            );
          }
        }
      } else {
        const savedResignationApprovalHistory =
          await resignationApprovalHistoryModel.updateMany(
            { resignationUUID: data.resignationUUID, isActive: true },
            { $set: { isActive: false } },
            { upsert: false }
          );
        let resignationUpdated = {};
        resignationUpdated.lastWorkingDate = data.relievingDate;
        resignationUpdated.status = data.approvalStatus;
        await resignationModel.updateOne(
          { uuid: data.resignationUUID },
          { $set: resignationUpdated },
          { upsert: false }
        );
        await resignationUtils.updateTransactionSummary(
          resignationData,
          req,
          "Rejected"
        );
      }
      return savedResignationApprovalHistory;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findResignationApprovalHistory = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationApprovalHistorySchema);
      const resignationApprovalHistoryModel = await getDBModel(
        DB,
        "resignationApprovalHistory"
      );
      return await resignationApprovalHistoryModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateResignationApprovalHistory = async (condition,data, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationApprovalHistorySchema);
      const resignationApprovalHistoryModel = await getDBModel(
        DB,
        "resignationApprovalHistory"
      );
      const savedResignationApprovalHistory = await resignationApprovalHistoryModel.updateMany(
        condition,
        { $set: data },
        { upsert: false }
      );
      return savedResignationApprovalHistory;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  delete = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationApprovalHistorySchema);
      const resignationApprovalHistoryModel = await getDBModel(
        DB,
        "resignationApprovalHistory"
      );
      // find and delete record in mongoDB
      return await resignationApprovalHistoryModel.deleteMany(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

}

module.exports = new ResignationApprovalHistoryService();
