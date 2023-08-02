const {
  switchDB,
  getDBModel,
  employeeEmailSchema,
  employeeSchema,
  uploadResultsSchema,
  employeeInfoHistorySchema,
} = require("../middlewares/switchDB");
const employeeEmailUtils = require("../utils/employeeEmailUtils");
const EmployeeInfoHistoryService = require("../services/employeeInfoHistoryService");
class EmployeeEmailService {
  constructor() {}

  createEmployeeEmail = async (data, req, res) => {
    try {
      if(!employeeEmailUtils.validateEmail(data.email)) throw new Error("Invalid Email")
      console.log("Data for employeeEmail create", data);
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      if (data.isPreferred) {
        const updated = await employeeEmailModel.updateMany(
          { employeeUUID: data.employeeUUID, isPreferred: true },
          { $set: { isPreferred: false } }
        );
        const historyUpdated = await employeeInfoHistoryModel.update(
          { employeeUUID: data.employeeUUID, type:"EmployeeEmail" },
          { $set: { "historyObject.isPreferred": false } }
        );
        console.log(updated);
      } else {
        const emailDetails = await this.findEmployeeEmail(
          {
            employeeUUID: data.employeeUUID,
            isPreferred: true,
          },
          req,
          res
        );
        if (emailDetails?.length == 0) {
          throw new Error("One Email Should be selected as Preferred");
        }
      }
      const duplicateEmailDetails = await this.findEmployeeEmail(
        {
          employeeUUID: data.employeeUUID,
          type: data.type,
        },
        req,
        res
      );
      if (duplicateEmailDetails.length > 0) {
        throw new Error(
          "Email Type '" +
            data.type +
            "' already exist for this employee. Kindly Verify"
        );
      }
      
      let savedEmployeeEmail = await employeeEmailModel.insertMany([data], {
        new:true, runValidators: true,
      });
      savedEmployeeEmail = savedEmployeeEmail[0]?._doc
      // store History
      const history = {
        employeeUUID: data.employeeUUID,
        documentUUID: savedEmployeeEmail?.uuid,
        type: "EmployeeEmail",
        name: "CREATE",
        historyObject: {
          type : data?.type,
          email : data?.email,
          isPreferred : data?.isPreferred
        },
        effectiveDate: data?.effectiveDate ?? new Date(),
        reason: data?.reason ?? "Create new Email",
        isDeleted: false,
      }
      const savedHistory = await EmployeeInfoHistoryService.storeHistory(
        history, req
      );
        
      savedEmployeeEmail["historyUUID"] = savedHistory[0]?._doc.uuid
      return savedEmployeeEmail;
    } catch (error) {
      console.log(error);
      if(error?.message?.includes("expected `email` to be unique")){
        throw new Error("Email already exists")
      }
      throw new Error(error);
    }
  };

  updateEmployeeEmail = async (data, req, res) => {
    try {
      if(!employeeEmailUtils.validateEmail(data.email)) throw new Error("Invalid Email")
      console.log("Data for employeeEmail update", data);
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      if (data.isPreferred) {
        const updated = await employeeEmailModel.updateMany(
          { employeeUUID: data.employeeUUID, isPreferred: true },
          { $set: { isPreferred: false } }
        );
        const historyUpdated = await employeeInfoHistoryModel.update(
          { employeeUUID: data.employeeUUID, type:"EmployeeEmail" },
          { $set: { "historyObject.isPreferred": false } }
        );
        console.log(updated);
      } else {
        const emailDetails = await this.findEmployeeEmail(
          {
            employeeUUID: data.employeeUUID,
            isPreferred: true,
          },
          req,
          res
        );
        if (emailDetails?.length == 0 || emailDetails[0].uuid == data.uuid) {
          throw new Error("One Email Should be selected as Preferred");
        }
      }
      let duplicateEmailDetails = await this.findEmployeeEmail(
        {
          employeeUUID: data.employeeUUID,
          email: data.email,
        },
        req,
        res
      );
      duplicateEmailDetails = await duplicateEmailDetails.filter(
        (email) => email.uuid != data.uuid
      );
      console.log("duplicate records ", duplicateEmailDetails);
      if (duplicateEmailDetails.length > 0) {
        throw new Error(
          "Email Address '" +
            data.email +
            "' already added for this employee. Kindly Verify"
        );
      }
      
      const updatedObj = await employeeEmailModel.findOneAndUpdate(
        { uuid: data.uuid },
        { $set: data },
        { new : true, upsert: false }
      );

      const historyObject = {
        type : data?.type,
        email : data?.email,
        isPreferred : data?.isPreferred
      }

      if(data?.historyUUID) {
        const historyObj = {
          name : "UPDATE",
          updateAt : new Date(),
          historyObject,
          reason: data?.reason ?? "Updated Email",
        }
        await employeeInfoHistoryModel.updateOne(
          { uuid: data.historyUUID },
          { $set: historyObj },
          { upsert: false }
        );
      } else {
        // store History
        const history = {
          employeeUUID: data.employeeUUID,
          documentUUID: updatedObj?.uuid,
          type: "EmployeeEmail",
          name: "UPDATE",
          historyObject,
          effectiveDate: data.effectiveDate ?? new Date(),
          reason: data?.reason ?? "Updated Email",
          isDeleted: false,
        }
        await EmployeeInfoHistoryService.storeHistory(
          history, req
        );
       }
      return updatedObj;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      return await employeeEmailModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeeEmail = async (query, req, res) => {
    try {
      console.log("Get employeeEmail, Data By: " + JSON.stringify(query));
      // const sessionId = Object.keys(req.sessionStore.sessions)[0];
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      return await employeeEmailModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req) => {
    try {
      console.log("Get employeeEmail, Data By: " + JSON.stringify(pipeline));
      // const sessionId = Object.keys(req.sessionStore.sessions)[0];
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      return await employeeEmailModel.aggregate(pipeline);
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
  }
  
  delete = async (query, body, req, res) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      // find and update record in mongoDB
      const existObj = await employeeEmailModel.findOne(query).lean();
      if (!existObj) throw new Error(`Could not find employee email`)
      if(existObj.isPreferred) throw new Error("Can not delete Preferred Email. Kindly Make another Email as Preferred or add new Preferred Email before Deleting")

      // store History
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
        const employeeInfoHistoryModel = await getDBModel(
          DB,
          "employeeInfoHistory"
        );
        const historyObj = {
          name :"DELETE",
          reason: body?.reason ?? "Delete Email",
          isDeleted : true
        }
        await employeeInfoHistoryModel.updateOne(
          { documentUUID: query.uuid },
          { $set: historyObj },
          { upsert: false }
        );

      return await employeeEmailModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  createAllEmployeeEmails = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;

      const allEmployeeEmails = await this.findAll(req, res);

      //getActiveEmployees
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const allEmployees = await employeeModel.find().lean();

      const employeeEmailSchemaDB = await switchDB(
        req.subdomain,
        employeeEmailSchema
      );
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const employeeEmailModel = await getDBModel(
        employeeEmailSchemaDB,
        "employeeEmail"
      );
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      const emailTypeList = ["Personal", "Confidential", "Official"];
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "employeeId" },
        { label: "Email_Type", key: "type" },
        { label: "Email_Address", key: "email" },
        { label: "Is_Primary", key: "isPreferred" }
      );
      let uploadingData = {
        type: "EmployeeEmail",
        uploadedBy: "namya",
        fileName: data.fileName,
        errorFileName: data.fileName,
        status: "InProgress",
        uploadedData: data.data,
        createdAt: new Date(),
        csvHeader: CSVHeader,
      };
      const createUploadResult = await uploadResultsModel.insertMany(
        [uploadingData],
        {
          runValidators: true,
        }
      );
      const mappedUploadingData = new Map();
      for (let i = 0; i < data.data?.length > 0; i++) {
        const employeeEmail = data.data[i];
        if (mappedUploadingData.get(employeeEmail.employeeId)) {
          mappedUploadingData.set(employeeEmail.employeeId, [
            ...mappedUploadingData.get(employeeEmail.employeeId),
            { ...employeeEmail, index: i },
          ]);
        } else {
          mappedUploadingData.set(employeeEmail.employeeId, [
            { ...employeeEmail, index: i },
          ]);
        }
      }
      const mappedExistingData = new Map();
      for (let i = 0; i < allEmployeeEmails?.length > 0; i++) {
        const employeeEmail = allEmployeeEmails[i];
        if (mappedExistingData.get(employeeEmail.employeeId)) {
          mappedExistingData.set(employeeEmail.employeeId, [
            ...mappedExistingData.get(employeeEmail.employeeId),
            employeeEmail,
          ]);
        } else {
          mappedExistingData.set(employeeEmail.employeeId, [employeeEmail]);
        }
      }
      console.log(mappedExistingData);

      for (let i = 0; i < data.data?.length > 0; i++) {
        const employeeEmail = data.data[i];

        console.log("processing the record: ", i + 1);
        const errors = await employeeEmailUtils.validateEmployeeEmail(
          employeeEmail,
          allEmployees,
          mappedUploadingData,
          mappedExistingData,
          i
        );
        if (errors.length > 0) {
          const errorData = { ...employeeEmail };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            const uploadingEmailsListOfEmployee = mappedUploadingData.get(
              employeeEmail.employeeId
            );
            const existingEmailsListOfEmployee = mappedExistingData
              ? mappedExistingData.get(employeeEmail.employeeId)
                ? mappedExistingData.get(employeeEmail.employeeId)
                : []
              : [];
            const duplicatePreferredRecordinUploadingData =
              uploadingEmailsListOfEmployee.filter(
                (emailData) =>
                  emailData.isPreferred.toLowerCase() ===
                    "true".toLowerCase() && i != emailData.index
              );
            const notPreferredRecordinUploadingData =
              uploadingEmailsListOfEmployee.filter(
                (emailData) =>
                  emailData.isPreferred.toLowerCase() === "false".toLowerCase()
              );
            const duplicatePreferredRecordinExistingData =
              existingEmailsListOfEmployee.filter(
                (emailData) => emailData.isPreferred
              );
            console.log(duplicatePreferredRecordinUploadingData);
            console.log(notPreferredRecordinUploadingData);
            console.log(duplicatePreferredRecordinExistingData);

            if (
              employeeEmail.isPreferred.toLowerCase() === "true".toLowerCase()
            ) {
              if (duplicatePreferredRecordinExistingData.length > 0) {
                const updatedEmails = await employeeEmailModel.updateMany(
                  { employeeId: employeeEmail.employeeId, isPreferred: true },
                  { $set: { isPreferred: false } }
                );
              }
            } else {
              if (
                duplicatePreferredRecordinExistingData.length == 0 &&
                notPreferredRecordinUploadingData.length ===
                  mappedUploadingData.get(employeeEmail.employeeId).length
              ) {
                employeeEmail.isPreferred = "true";
              }
            }

            // if(employeeEmail.employeeId  && allEmployees?.length>0) {
            //   employeeEmail.employeeId = allEmployees.find(e => e.id == employeeEmail.employeeId)?.uuid
            // }

            const employeeEmailData = {
              ...employeeEmail,
            };
            employeeEmailData.isPreferred =
              employeeEmail.isPreferred?.toLowerCase() === "true".toLowerCase();
            const emailTypeIndex = emailTypeList.findIndex(
              (emailType) =>
                emailType.toLowerCase() == employeeEmail.type.toLowerCase()
            );
            employeeEmailData.type = emailTypeList[emailTypeIndex];

            const savedEmployeeEmail = await employeeEmailModel.insertMany(
              [employeeEmailData],
              { runValidators: true }
            );

            const historyObject= {
              type : employeeEmail?.type,
              email : employeeEmail?.email,
              isPreferred : employeeEmail?.isPreferred
            }
            // Strore History
            const history = {
              employeeUUID: data.employeeUUID,
              documentUUID: savedEmployeeEmail[0]?.uuid,
              type: "EmployeeEmail",
              name: "CREATE",
              historyObject,
              effectiveDate: new Date(),
              reason: "Create new Email",
              isDeleted: false,
            }
            await EmployeeInfoHistoryService.storeHistory(
              history, req
            );

            if (savedEmployeeEmail.length > 0) {
              sucessList.push(employeeEmailData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...employeeEmail };
            errorData.errors = error.errors?.code?.properties?.message;
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
            console.log("err", error);
          }
        }
        console.log("processed record", i + 1);
      }
      const updateUploadResult = await uploadResultsModel.updateOne(
        { _id: createUploadResult[0]._id },
        {
          $set: {
            status:
              sucessfullyAddedCount == data.data.length ? "Sucess" : "Rejected",
            errorData: errorList,
            updatedAt: new Date(),
          },
        },
        { upsert: false, runValidators: true }
      );
      console.log();
      return {
        totalRecords: data.data.length,
        sucessfullyAdded: sucessfullyAddedCount,
        errorCount: errorCount,
        errorData: errorList,
        sucessData: sucessList,
        data: data.data,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new EmployeeEmailService();
