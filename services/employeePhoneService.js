const {
  switchDB,
  getDBModel,
  employeePhoneSchema,
  employeeSchema,
  uploadResultsSchema,
  employeeInfoHistorySchema,
} = require("../middlewares/switchDB");
const employeePhoneUtils = require("../utils/employeePhoneUtils");
const employeeInfoHistoryService = require("./employeeInfoHistoryService");

class EmployeePhoneService {
  constructor() {}

  createEmployeePhone = async (data, req, res) => {
    try {
      if(!employeePhoneUtils.validatePhoneNumber(data.phoneNumber)) throw new Error("Invalid Phone Number")
      console.log("Data for employeePhone create", data);
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      if (data.isPreferred) {
        const updated = await employeePhoneModel.update(
          { employeeUUID: data.employeeUUID, isPreferred: true },
          { $set: { isPreferred: false } }
        );
        const historyUpdated = await employeeInfoHistoryModel.update(
          { employeeUUID: data.employeeUUID, type:"EmployeePhone" },
          { $set: { "historyObject.isPreferred": false } }
        );
        console.log(updated);
      } else {
        const phoneDetails = await this.findEmployeePhone(
          {
            employeeUUID: data.employeeUUID,
            isPreferred: true,
          },
          req,
          res
        );
        if (phoneDetails?.length == 0) {
          throw new Error("One Phone Number Should be selected as Preferred");
        }
      }
      const duplicatePhoneDetails = await this.findEmployeePhone(
        {
          employeeUUID: data.employeeUUID,
          type: data.type,
        },
        req,
        res
      );
      console.log("duplicate records ", duplicatePhoneDetails);
      if (duplicatePhoneDetails.length > 0) {
        throw new Error(
          "Type'" +
            data.type +
            "' already exist for this employee. Kindly Verify"
        );
      }
      
      let savedEmployeePhone = await employeePhoneModel.insertMany([data], {
        new:true, runValidators: true,
      });

      savedEmployeePhone = savedEmployeePhone[0]?._doc
      // store History
      const history = {
        employeeUUID: data.employeeUUID,
        documentUUID: savedEmployeePhone?.uuid,
        type: "EmployeePhone",
        name: "CREATE",
        historyObject: {
          type : data?.type,
          phoneNumber : data?.phoneNumber,
          isPreferred : data?.isPreferred
        },
        effectiveDate: data?.effectiveDate ?? new Date(),
        reason: data?.reason ?? "Create new PhoneNumber",
        isDeleted: false,
      }
      const savedHistory = await employeeInfoHistoryService.storeHistory(
        history, req
      );

      savedEmployeePhone["historyUUID"] = savedHistory[0]?._doc.uuid
      return savedEmployeePhone;
    } catch (error) {
      console.log(error);
      if(error?.message?.includes("expected `phoneNumber` to be unique")){
        throw new Error("PhoneNumber already exists")
      }
      throw new Error(error);
    }
  };

  updateEmployeePhone = async (data, req, res) => {
    try {
      if(!employeePhoneUtils.validatePhoneNumber(data.phoneNumber)) throw new Error("Invalid Phone Number")
      console.log("Data for employeePhone update", data);
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      if (data.isPreferred) {
        const updated = await employeePhoneModel.update(
          { employeeUUID: data.employeeUUID, isPreferred: true },
          { $set: { isPreferred: false } }
        );
        const historyUpdated = await employeeInfoHistoryModel.update(
          { employeeUUID: data.employeeUUID, type:"EmployeePhone" },
          { $set: { "historyObject.isPreferred": false } }
        );
        console.log(updated);
      } else {
        const phoneDetails = await this.findEmployeePhone(
          {
            employeeUUID: data.employeeUUID,
            isPreferred: true,
          },
          req,
          res
        );
        if (phoneDetails?.length == 0 || phoneDetails[0].uuid == data.uuid) {
          throw new Error("One Phone Number Should be selected as Preferred");
        }
      }
      let duplicatePhoneDetails = await this.findEmployeePhone(
        {
          employeeUUID: data.employeeUUID,
          type: data.type,
          phoneNumber: data.phoneNumber,
        },
        req,
        res
      );
      duplicatePhoneDetails = await duplicatePhoneDetails.filter(
        (phone) => phone.uuid != data.uuid
      );
      if (duplicatePhoneDetails.length > 0) {
        throw new Error(
          "Phone Number '" +
            data.phoneNumber +
            "' already added for this employee. Kindly Verify"
        );
      }
      
      const updatedObj = await employeePhoneModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { new : true, upsert: false }
      );

      const historyObject = {
        type : data?.type,
        phoneNumber : data?.phoneNumber,
        isPreferred : data?.isPreferred
      }

      if(data?.historyUUID) {
        const historyObj = {
          name : "UPDATE",
          updateAt : new Date(),
          effectiveDate: data.effectiveDate ?? new Date(),
          reason: data?.reason ?? "Updated Phonenumber",
          historyObject
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
          documentUUID: data?.uuid,
          type: "EmployeePhone",
          name: "UPDATE",
          historyObject,
          effectiveDate: data.effectiveDate ?? new Date(),
          reason: data?.reason ?? "Updated Phonenumber",
          isDeleted: false,
        }
        await employeeInfoHistoryService.storeHistory(
          history, req
        );
       }
       return updatedObj;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      return await employeePhoneModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      return await employeePhoneModel.find().lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeePhone = async (query, req, res) => {
    try {
      console.log("Get employeePhone, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      return await employeePhoneModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  delete = async (query, body , req, res) => {
    try {
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      // find and update record in mongoDB

      // store History
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
        const employeeInfoHistoryModel = await getDBModel(
          DB,
          "employeeInfoHistory"
        );
        const phoneRecord=await employeePhoneModel.findOne(query).lean();
        if(!phoneRecord)throw new Error("Phone Number not available to delete")
        if(phoneRecord.isPreferred) throw new Error("Can not delete Preferred PhoneNumber. Kindly Make another PhoneNumber as Preferred or add new Preferred Phone Number before Deleting")
        const historyObj = {
          name :"DELETE",
          reason: body?.reason ?? "Delete Phonenumber",
          isDeleted : true
        }
        await employeeInfoHistoryModel.updateOne(
          { documentUUID: query.uuid },
          { $set: historyObj },
          { upsert: false }
        );

      return await employeePhoneModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  createAllEmployeePhones = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;

      const allEmployeePhones = await this.findAll(req, res);

      //getActiveEmployees
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const allEmployees = await employeeModel.find().lean();

      const employeePhoneSchemaDB = await switchDB(
        req.subdomain,
        employeePhoneSchema
      );
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const employeePhoneModel = await getDBModel(
        employeePhoneSchemaDB,
        "employeePhone"
      );
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      const phoneTypeList = ["Mobile", "Residence", "Official", "Public"];
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "employeeId" },
        { label: "Phone_Number", key: "phoneNumber" },
        { label: "Phone_Type", key: "type" },
        { label: "Is_Primary", key: "isPreferred" }
      );
      let uploadingData = {
        type: "EmployeePhone",
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
        const employeePhone = data.data[i];
        if (mappedUploadingData.get(employeePhone.employeeId)) {
          mappedUploadingData.set(employeePhone.employeeId, [
            ...mappedUploadingData.get(employeePhone.employeeId),
            { ...employeePhone, index: i },
          ]);
        } else {
          mappedUploadingData.set(employeePhone.employeeId, [
            { ...employeePhone, index: i },
          ]);
        }
      }
      const mappedExistingData = new Map();
      for (let i = 0; i < allEmployeePhones?.length > 0; i++) {
        const employeePhone = allEmployeePhones[i];
        if (mappedExistingData.get(employeePhone.employeeId)) {
          mappedExistingData.set(employeePhone.employeeId, [
            ...mappedExistingData.get(employeePhone.employeeId),
            employeePhone,
          ]);
        } else {
          mappedExistingData.set(employeePhone.employeeId, [employeePhone]);
        }
      }
      console.log(mappedExistingData);

      for (let i = 0; i < data.data?.length > 0; i++) {
        const employeePhone = data.data[i];

        console.log("processing the record: ", i + 1);
        const errors = await employeePhoneUtils.validateEmployeePhone(
          employeePhone,
          allEmployees,
          mappedUploadingData,
          mappedExistingData,
          i
        );
        if (errors.length > 0) {
          const errorData = { ...employeePhone };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            const uploadingPhonesListOfEmployee = mappedUploadingData.get(
              employeePhone.employeeId
            );
            const existingPhonesListOfEmployee = mappedExistingData
              ? mappedExistingData.get(employeePhone.employeeId)
                ? mappedExistingData.get(employeePhone.employeeId)
                : []
              : [];
            console.log(mappedExistingData.get(employeePhone.employeeId));
            const duplicatePreferredRecordinUploadingData =
              uploadingPhonesListOfEmployee.filter(
                (phoneData) =>
                  phoneData.isPreferred.toLowerCase() ===
                    "true".toLowerCase() && i != phoneData.index
              );
            const notPreferredRecordinUploadingData =
              uploadingPhonesListOfEmployee.filter(
                (phoneData) =>
                  phoneData.isPreferred.toLowerCase() === "false".toLowerCase()
              );
            const duplicatePreferredRecordinExistingData =
              existingPhonesListOfEmployee.filter(
                (phoneData) => phoneData.isPreferred
              );
            console.log(duplicatePreferredRecordinUploadingData);
            console.log(notPreferredRecordinUploadingData);
            console.log(duplicatePreferredRecordinExistingData);

            if (
              employeePhone.isPreferred.toLowerCase() === "true".toLowerCase()
            ) {
              if (duplicatePreferredRecordinExistingData.length > 0) {
                const updatedPhones = await employeePhoneModel.updateMany(
                  { employeeId: employeePhone.employeeId, isPreferred: true },
                  { $set: { isPreferred: false } }
                );
              }
            } else {
              if (
                duplicatePreferredRecordinExistingData.length == 0 &&
                notPreferredRecordinUploadingData.length ===
                  mappedUploadingData.get(employeePhone.employeeId).length
              ) {
                employeePhone.isPreferred = "true";
              }
            }
            // if(employeePhone.employeeId  && allEmployees?.length>0) {
            //   employeePhone.employeeId = allEmployees.find(e => e.id == employeePhone?.employeeId)?.uuid
            // }

            const employeePhoneData = {
              ...employeePhone,
            };
            employeePhoneData.isPreferred =
              employeePhone.isPreferred?.toLowerCase() === "true".toLowerCase();
            const phoneTypeIndex = phoneTypeList.findIndex(
              (phoneType) =>
                phoneType.toLowerCase() == employeePhone.type.toLowerCase()
            );
            employeePhoneData.type = phoneTypeList[phoneTypeIndex];

            const savedEmployeePhone = await employeePhoneModel.insertMany(
              [employeePhoneData],
              { runValidators: true }
            );

            const historyObject= {
              type : employeePhone?.type,
              email : employeePhone?.email,
              isPreferred : employeePhone?.isPreferred
            }
            // Strore History
            const history = {
              employeeUUID: data.employeeUUID,
              documentUUID: savedEmployeePhone[0]?.uuid,
              type: "EmployeePhone",
              name: "CREATE",
              historyObject,
              effectiveDate: new Date(),
              reason: "Create new phonenumber",
              isDeleted: false,
            }
            await employeeInfoHistoryService.storeHistory(
              history, req
            );

            if (savedEmployeePhone.length > 0) {
              sucessList.push(employeePhoneData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...employeePhone };
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

module.exports = new EmployeePhoneService();
