const {
  switchDB,
  getDBModel,
  resignationSchema,
  resignationApprovalHistorySchema,
  separationControlSchema,
  employeeSchema,
  rolesSchema,
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");
const resignationUtils = require("../utils/resignationUtils");
const { CORE_HR_ADMIN, MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");
const { generateMail } = require("../utils/mailNotificationUtils");

class ResignationService {
  constructor() {}

  createResignation = async (data, req, res) => {
    try {
      console.log("Data for resignation create", data);
      const companyName = req.subdomain;
      const resignationDB = await switchDB(companyName, resignationSchema);
      const resignationModel = await getDBModel(resignationDB, "resignation");
      const resignationApprovalHistoryDB = await switchDB(
        companyName,
        resignationApprovalHistorySchema
      );
      const resignationApprovalHistoryModel = await getDBModel(
        resignationApprovalHistoryDB,
        "resignationApprovalHistory"
      );

      //separation control data
      const SeparationControlDB = await switchDB(
        companyName,
        separationControlSchema
      );
      const separationControlModel = await getDBModel(
        SeparationControlDB,
        "separationControl"
      );
      const separationControlData = await separationControlModel
        .findOne({})
        .lean();

      const approvalCriteria = resignationUtils.getApproverCriteria(
        data,
        separationControlData.approvalPath
      );

      data.uuid = uuidv4();
      let savedResignation;
      if (approvalCriteria.length > 0){
        savedResignation = await resignationModel.insertMany([data], {
          runValidators: true,
        });
        if(data.submittedBy.toLowerCase() === "Employee".toLowerCase()){
          const inputObj=savedResignation[0];
          const obj={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
          generateMail(MAIL_NOTIFICATION_TYPE.EMPLOYEE_SUBMITS_RESIGNATION,obj,req,inputObj)
        }
        else if(data.submittedBy.toLowerCase() === "Manager".toLowerCase()){
          const inputObj=savedResignation[0];
          const obj={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
          generateMail(MAIL_NOTIFICATION_TYPE.MANAGER_PROXY_RESIGNATION_SUBMISSION,obj,req,inputObj)
        }
        else if(data.submittedBy.toLowerCase() === "Admin".toLowerCase()){
          const inputObj=savedResignation[0];
          const obj={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
          generateMail(MAIL_NOTIFICATION_TYPE.ADMIN_PROXY_RESIGNATION_SUBMISSION,obj,req,inputObj)
        }
      }
      else throw new Error("Exit Controls Not Defined");
      await resignationUtils.createTransactionSummary(data,req);
      //first approver , last approver
      const fisrtApprover = approvalCriteria?.[0];
      const lastApprover =
        approvalCriteria.length > 1
          ? approvalCriteria[approvalCriteria.length - 1]
          : null;
      //employee details
      const employeeDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const employeeData = await employeeModel.findOne({
        uuid: data.employeeUUID,
      });
      const isFirstApproverAdmin =
        fisrtApprover?.approver.toLowerCase() === "Admin".toLowerCase();
      const isLastApproverAdmin =
        lastApprover?.approver.toLowerCase() === "Admin".toLowerCase();

      const DB = await switchDB(companyName, rolesSchema);
      const roleModel = await getDBModel(DB, "roles");
      let adminEmployees = [];
      if (isFirstApproverAdmin || isLastApproverAdmin) {
        const adminRole = await roleModel.findOne({
          name: new RegExp(CORE_HR_ADMIN, "i"),
        });
        adminEmployees = await employeeModel.find({
          roleUUIDs: adminRole.uuid,
        }).lean();
      }
      const resignationApprovalHistoryDataList = [];
      if (isFirstApproverAdmin) {
        adminEmployees.forEach((emp) => {
          resignationApprovalHistoryDataList.push(
            resignationUtils.generateResignationHistoryObject(
              fisrtApprover,
              emp.uuid,
              data.uuid
            )
          );
        });
      } else {
        if (fisrtApprover) {
          const resignationApprovalHistoryData =
            resignationUtils.generateResignationHistoryObject(
              fisrtApprover,
              employeeData.managerUUID,
              data.uuid
            );
          //if submitted by is `Manager` &  autoApprove is true then update  `comments`, `isActive` to false, `acceptanceCriteria` based on isEarlyExit boolean, `relievingDate` , 'approvalStatus' as Approved
          if (
            data.submittedBy.toLowerCase() === "Manager".toLowerCase() &&
            data.autoApprove
          ) {
            resignationApprovalHistoryData.comments =
              "Resignation auto approved By manager.";
            resignationApprovalHistoryData.isActive = false;
            resignationApprovalHistoryData.approvalStatus = "Approved";
            if (data.isEarlyExit) {
              resignationApprovalHistoryData.acceptanceCriteria =
                "As per employee's date";
              resignationApprovalHistoryData.relievingDate =
                data.lastWorkingDateAsPerEmployee;
            } else {
              resignationApprovalHistoryData.acceptanceCriteria =
                "As per Policy";
              resignationApprovalHistoryData.relievingDate =
                data.lastWorkingDateAsPerPolicy;
            }
          }
          resignationApprovalHistoryDataList.push(
            resignationApprovalHistoryData
          );
          if (isLastApproverAdmin) {
            adminEmployees.forEach((emp) => {
              resignationApprovalHistoryDataList.push(
                resignationUtils.generateResignationHistoryObject(
                  lastApprover,
                  emp.uuid,
                  data.uuid
                )
              );
            });
          }
        }
      }
      await resignationApprovalHistoryModel.insertMany(
        resignationApprovalHistoryDataList,
        { runValidators: true }
      );
      return savedResignation;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateResignation = async (data, req, res) => {
    try {
      console.log("Data for resignation update", data);
      if (!data.uuid) throw new Error("UUID is required");
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationSchema);
      const resignationModel = await getDBModel(DB, "resignation");
      const savedResignation = await resignationModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false }
      );
      return savedResignation;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  editResignation = async (data, req, res) => {
    try {
      console.log("Data for resignation update", data);
      if (!data.uuid) throw new Error("UUID is required");
      const companyName = req.subdomain;
      const resignationDB = await switchDB(companyName, resignationSchema);
      const resignationModel = await getDBModel(resignationDB, "resignation");
      const resignationApprovalHistoryDB = await switchDB(companyName, resignationApprovalHistorySchema);
      const resignationApprovalHistoryModel = await getDBModel(
        resignationApprovalHistoryDB,
        "resignationApprovalHistory"
      );
      const savedResignation = await resignationModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false }
      );
      await resignationApprovalHistoryModel.deleteMany({resignationUUID:data.uuid})
      const SeparationControlDB = await switchDB(
        companyName,
        separationControlSchema
      );
      const separationControlModel = await getDBModel(
        SeparationControlDB,
        "separationControl"
      );
      const separationControlData = await separationControlModel
        .findOne({})
        .lean();

      const approvalCriteria = resignationUtils.getApproverCriteria(
        data,
        separationControlData.approvalPath
      );
      const fisrtApprover = approvalCriteria?.[0];
      const lastApprover =
        approvalCriteria.length > 1
          ? approvalCriteria[approvalCriteria.length - 1]
          : null;
      //employee details
      const employeeDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const employeeData = await employeeModel.findOne({
        uuid: data.employeeUUID,
      });
      const isFirstApproverAdmin =
        fisrtApprover?.approver.toLowerCase() === "Admin".toLowerCase();
      const isLastApproverAdmin =
        lastApprover?.approver.toLowerCase() === "Admin".toLowerCase();

      const DB = await switchDB(companyName, rolesSchema);
      const roleModel = await getDBModel(DB, "roles");
      let adminEmployees = [];
      if (isFirstApproverAdmin || isLastApproverAdmin) {
        const adminRole = await roleModel.findOne({
          name: new RegExp(CORE_HR_ADMIN, "i"),
        });
        adminEmployees = await employeeModel.find({
          roleUUIDs: adminRole.uuid,
        }).lean();
      }
      const resignationApprovalHistoryDataList = [];
      if (isFirstApproverAdmin) {
        adminEmployees.forEach((emp) => {
          resignationApprovalHistoryDataList.push(
            resignationUtils.generateResignationHistoryObject(
              fisrtApprover,
              emp.uuid,
              data.uuid
            )
          );
        });
      } else {
        if (fisrtApprover) {
          const resignationApprovalHistoryData =
            resignationUtils.generateResignationHistoryObject(
              fisrtApprover,
              employeeData.managerUUID,
              data.uuid
            );
          //if submitted by is `Manager` &  autoApprove is true then update  `comments`, `isActive` to false, `acceptanceCriteria` based on isEarlyExit boolean, `relievingDate` , 'approvalStatus' as Approved
          if (
            data.submittedBy.toLowerCase() === "Manager".toLowerCase() &&
            data.autoApprove
          ) {
            resignationApprovalHistoryData.comments =
              "Resignation auto approved By manager.";
            resignationApprovalHistoryData.isActive = false;
            resignationApprovalHistoryData.approvalStatus = "Approved";
            if (data.isEarlyExit) {
              resignationApprovalHistoryData.acceptanceCriteria =
                "As per employee's date";
              resignationApprovalHistoryData.relievingDate =
                data.lastWorkingDateAsPerEmployee;
            } else {
              resignationApprovalHistoryData.acceptanceCriteria =
                "As per Policy";
              resignationApprovalHistoryData.relievingDate =
                data.lastWorkingDateAsPerPolicy;
            }
          }
          resignationApprovalHistoryDataList.push(
            resignationApprovalHistoryData
          );
          if (isLastApproverAdmin) {
            adminEmployees.forEach((emp) => {
              resignationApprovalHistoryDataList.push(
                resignationUtils.generateResignationHistoryObject(
                  lastApprover,
                  emp.uuid,
                  data.uuid
                )
              );
            });
          }
        }
      }
      return savedResignation;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findResignation = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationSchema);
      const resignationModel = await getDBModel(DB, "resignation");
      return await resignationModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findResignationByAggregation = async (pipeline, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, resignationSchema);
      const resignationModel = await getDBModel(DB, "resignation");
      return await resignationModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  
}

module.exports = new ResignationService();
