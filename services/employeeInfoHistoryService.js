const {
  switchDB,
  getDBModel,
  employeeInfoHistorySchema,
  employeeSchema,
  actionSchemas,
  timelineSchemas,
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");
const EmployeeInfoHistoryUtils = require("../utils/employeeInfoHistoryUtils");
const { generateMail } = require("../utils/mailNotificationUtils");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");

class EmployeeInfoHistoryService {
  constructor() {}

  createEmployeeInfoHistory = async (data, req, res) => {
    try {
      console.log("Data for employeeInfoHistory create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      const actionDB = await switchDB(companyName, actionSchemas);
      const actionModel = await getDBModel(actionDB, "action");

      const employeeDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");

      const seperateAction = await actionModel
      .findOne({
        actionCode:{ $regex: "SEP", '$options': 'i' } ,
        isActive: true,
      })
      .lean(); 
      data.uuid = uuidv4();
      data.name = "CREATE";
      const existingRecords = await employeeInfoHistoryModel.find({
        type: data.type,
        employeeUUID: data.employeeUUID,
      });
      const allEmployees = await employeeModel.find({managerUUID: data.employeeUUID}, {_id:0,uuid:1}).lean();  
      data.orderNo = existingRecords.length + 1;
      let errors = await EmployeeInfoHistoryUtils.validateEmployeeInfoHistory(
        data,
        req,
        allEmployees
      );
      if (errors.length > 0) {
        throw new Error(errors.toString());
      } else {
        const employeeDB = await switchDB(companyName, employeeSchema);
        const employeeModel = await getDBModel(employeeDB, "employee");

        const oldDetail = await employeeModel.findOne({uuid: data.employeeUUID}).lean()

        let employeeobject = null;
        if (data.type.toLowerCase() == "EmployeeName".toLowerCase()) {
          employeeobject = {
            firstName: data.historyObject.firstName,
            middleName: data.historyObject.middleName,
            lastName: data.historyObject.lastName,
          };
        }
        if (data.type.toLowerCase() == "EmployeeGender".toLowerCase()) {
          employeeobject = {
            gender: data.historyObject.gender,
          };
        }
        if (data.type.toLowerCase() == "EmployeeJobDetails".toLowerCase()) {
          employeeobject = {
            jobType: data.historyObject.jobType,
            jobStatus: data.historyObject.jobStatus,
            hireDate: data.historyObject.hireDate,
            department: data.historyObject.department,
            location: data.historyObject.location,
            designation: data.historyObject.designation,
            managerUUID: data.historyObject.managerUUID,
          };
          if(data.historyObject.action==seperateAction?.actionCode){
            employeeobject.isActive=false
          }
        }
        if(employeeobject) {
            const updatedEmployee = await employeeModel.updateOne(
                { uuid: data.employeeUUID },
                { $set: employeeobject },
                { upsert: false }
            );
            if(data.type.toLowerCase() == "EmployeeGender".toLowerCase()||data.type.toLowerCase() == "EmployeeName".toLowerCase()){
              const inputObj=employeeobject;
              const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
              generateMail(MAIL_NOTIFICATION_TYPE.EDIT_PERSONAL_DETAILS,body,req,inputObj)  
            }
            if(data.type.toLowerCase() == "EmployeeJobDetails".toLowerCase()){
              const inputObj=employeeobject;
              const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
              generateMail(MAIL_NOTIFICATION_TYPE.EDIT_JOB_DETAILS,body,req,inputObj)  
            }
        }
        let savedEmployeeInfoHistory;
        try {
          savedEmployeeInfoHistory = await employeeInfoHistoryModel.insertMany(
            [data],
            {
              runValidators: true,
            }
          );
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }

        let timelineArray = []
        if(data.name == "CREATE" && data.type.toLowerCase() == "EmployeeJobDetails".toLowerCase())  {
          
          const promotionAction = await actionModel
          .findOne({
            actionCode:{ $regex: "PROM", '$options': 'i' } ,
            isActive: true,
          }, {actionCode: 1, _id:0}).lean(); 
          if(data.historyObject.action == promotionAction?.actionCode) {
            timelineArray.push(
            {
              incident: "Promotion",
              employeeUUID: data.employeeUUID,
            })
          } else {
            if(oldDetail) {
              if(oldDetail.department != data.historyObject.department) { 
                timelineArray.push(
                  {
                    incident: "Moved To New Department",
                    employeeUUID: data.employeeUUID,
                  })
              }
              if(oldDetail.location != data.historyObject.location)
              { 
                timelineArray.push(
                  {
                    incident:  "Moved To New Location",
                    employeeUUID: data.employeeUUID,
                  })
              }
              
              if(oldDetail.designation != data.historyObject.designation)
              { 
                timelineArray.push(
                  {
                    incident:  "New Designation",
                    employeeUUID: data.employeeUUID,
                  })
              }
            }
          }
        }
        if(data.name == "CREATE" && data.type.toLowerCase() == "EmployeeEmergencyContact".toLowerCase()) {
          timelineArray.push(
            {
              incident:  "New Emergency Contact",
              employeeUUID: data.employeeUUID,
            })
        }
        if(timelineArray.length>0) {
          const timelineDB = await switchDB(companyName, timelineSchemas);
          const timelineModel = await getDBModel(timelineDB, "timeline");
          const timeline = await timelineModel.insertMany(
            timelineArray
          );
        }
        return savedEmployeeInfoHistory;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateEmployeeInfoHistory = async (data, req, res) => {
    try {
      console.log("Data for employeeInfoHistory update", data);
      const companyName = req.subdomain;
      const employeeDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      
      const allEmployees = await employeeModel.find({managerUUID: data.uuid}, {_id:0,uuid:1}).lean();  
     
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      
      data.name = "UPDATE";
      let employeeobject = null;
      let errors = await EmployeeInfoHistoryUtils.validateEmployeeInfoHistory(
        data,
        req,
        allEmployees
      );
      const actionDB = await switchDB(companyName, actionSchemas);
      const actionModel = await getDBModel(actionDB, "action");
      if (errors.length > 0) {
        throw new Error(errors.toString());
      } else {
        
        const existingRecords = await employeeInfoHistoryModel
          .find({
            type: data.type,
            employeeUUID: data.employeeUUID,
            isDeleted: false,
          })
          .sort({ orderNo: -1 })
          .lean();
        let maxExistingHistory = existingRecords[0];
        if (maxExistingHistory.uuid === data.uuid) {
          if (data.type.toLowerCase() == "EmployeeName".toLowerCase()) {
            employeeobject = {
              firstName: data.historyObject.firstName,
              middleName: data.historyObject.middleName,
              lastName: data.historyObject.lastName,
            };
          }
          if (data.type.toLowerCase() == "EmployeeGender".toLowerCase()) {
            employeeobject = {
              gender: data.historyObject.gender,
            };
          }
          if (data.type.toLowerCase() == "EmployeeJobDetails".toLowerCase()) {
            employeeobject = {
              jobType: data.historyObject.jobType,
              jobStatus: data.historyObject.jobStatus,
              hireDate: data.historyObject.hireDate,
              department: data.historyObject.department,
              location: data.historyObject.location,
              designation: data.historyObject.designation,
              managerUUID: data.historyObject.managerUUID,
            };
          const seperateAction = await actionModel
          .findOne({
            actionCode:{ $regex: "SEP", '$options': 'i' } ,
            isActive: true,
          })
          .lean();
          if(data.historyObject.action==seperateAction?.actionCode){
            employeeobject.isActive=false
          }
        }
          if(employeeobject) {
              const updatedEmployee = await employeeModel.updateOne(
                  { uuid: data.employeeUUID },
                  { $set: employeeobject },
                  { upsert: false }
              );
          }
        }
        const savedEmployeeInfoHistory =
          await employeeInfoHistoryModel.updateOne(
            { uuid: data.uuid },
            { $set: data },
            { upsert: false }
          );
        return savedEmployeeInfoHistory;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findEmployeeInfoHistory = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      if(query.type == "EmployeeJobDetails") {
        const pipeline = [
          {
              $match: {
                  type: "EmployeeJobDetails",
                  employeeUUID: query.employeeUUID,
                  isDeleted: false
              }
          },
          {
              $lookup: {
                  from: 'action',
                  let : { "actionCode": "$historyObject.action" },
                  "pipeline": [
                      { "$match": { "$expr": { "$eq": ["$actionCode", "$$actionCode"] }}},
                      { "$project": {  _id:0, "actionName": 1,"actionCode":1}}
                    ],
                  as: 'actionRecord',
              }
          },
          {
              $unwind : {
                  path:"$actionRecord"
              }
          },
          {
              $lookup: {
                  from: 'reasons',
                  let : { "reasonCode": "$historyObject.actionReason" },
                  "pipeline": [
                      { "$match": { "$expr": { "$eq": ["$reasonCode", "$$reasonCode"] }}},
                      { "$project": {  _id:0, "reasonName": 1}}
                    ],
                  as: 'reasonName',
              }
          },
          {
              $unwind : {
                  path:"$reasonName"
              }
          },
          {
              $addFields: {
                  actionName: "$actionRecord.actionName",
                  actionCode: "$actionRecord.actionCode",
                  reasonName: "$reasonName.reasonName"
              }
          },
          {
            $sort: {
              orderNo: -1
            }
          }
        ]
        return await employeeInfoHistoryModel.aggregate(pipeline)
      } else {
        return await employeeInfoHistoryModel.find(query).sort({ orderNo: -1 });
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  deleteEmployeeInfoHistory = async (data, req, res) => {
    try {
      console.log("Data for employeeInfoHistory delete", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeInfoHistorySchema);
      const employeeInfoHistoryModel = await getDBModel(
        DB,
        "employeeInfoHistory"
      );
      const actionDB = await switchDB(companyName, actionSchemas);
      const actionModel = await getDBModel(actionDB, "action");
      const seperateAction = await actionModel
      .findOne({
        actionCode:{ $regex: "SEP", '$options': 'i' } ,
        isActive: true,
      })
      .lean(); 
      const employeeDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
     
      data.name = "DELETE";
      let employeeobject = {};
      const existingRecords = await employeeInfoHistoryModel
        .find({
          type: data.type,
          employeeUUID: data.employeeUUID,
          isDeleted: false,
        })
        .sort({ orderNo: -1 })
        .lean();
      if (existingRecords.length > 1) {
        let maxExistingHistory = existingRecords[0];
        let secondMaxExistingHistory = existingRecords[1];
        if (maxExistingHistory.uuid === data.uuid) {
          if (data.type.toLowerCase() == "EmployeeName".toLowerCase()) {
            employeeobject = {
              firstName: secondMaxExistingHistory.historyObject.firstName,
              middleName: secondMaxExistingHistory.historyObject.middleName,
              lastName: secondMaxExistingHistory.historyObject.lastName,
            };
          }
          if (data.type.toLowerCase() == "EmployeeGender".toLowerCase()) {
            employeeobject = {
              gender: secondMaxExistingHistory.historyObject.gender,
            };
          }
          if (data.type.toLowerCase() == "EmployeeJobDetails".toLowerCase()) {
            employeeobject = {
              jobType: secondMaxExistingHistory.historyObject.jobType,
              jobStatus: secondMaxExistingHistory.historyObject.jobStatus,
              hireDate: secondMaxExistingHistory.historyObject.hireDate,
              department: secondMaxExistingHistory.historyObject.department,
              location: secondMaxExistingHistory.historyObject.location,
              designation: secondMaxExistingHistory.historyObject.designation,
              managerUUID: secondMaxExistingHistory.historyObject.managerUUID,
            };
            if(data.historyObject.action==seperateAction?.actionCode){
              employeeobject.isActive=true
            }
          }
          if (employeeobject) {
            const updatedEmployee = await employeeModel.updateOne(
              { uuid: data.employeeUUID },
              { $set: employeeobject },
              { upsert: false }
            );
          }
        }
        data.isDeleted = true;
        const savedEmployeeInfoHistory =
          await employeeInfoHistoryModel.updateOne(
            { uuid: data.uuid },
            { $set: data },
            { upsert: false }
          );
        if (savedEmployeeInfoHistory.modifiedCount == 1)
          return res.status(200).send("Deleted Sucessfully");
        else return res.status(400).send("Unable to delete");
      } else {
        return res
          .status(400)
          .send(
            "Last Record can not be deleted directly. kindly add new record and then delete existing one"
          );
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  storeHistory = async(data, req) => {
    // History
    const companyName = req.subdomain;
    const DB = await switchDB(companyName, employeeInfoHistorySchema);
    const employeeInfoHistoryModel = await getDBModel(DB,"employeeInfoHistory");
    const existingRecords = await employeeInfoHistoryModel.find({
      type: data.type,
      employeeUUID: data.employeeUUID,
    });
    data.orderNo = existingRecords.length + 1;

    const savedEmployeeInfoHistory = await employeeInfoHistoryModel.insertMany(
      [data],
      {
        runValidators: true,
      }
    );
    if(data.name == "CREATE") {
      let incident=null;
      if(data.type == "EmployeeEmergencyContact")  {
        incident = "New Emergency Contact";
      }
      if(data.type == "EmployeeAddress")  {
        incident = "New Address";
      }
      if(data.type == "Beneficiary")  {
        incident = "New Beneficiary";
      }
      if(data.type == "Dependant")  {
        incident = "New Dependant";
      }
      if(data.type == "Certificate")  {
        incident = "New Certificate";
      }
      if(data.type == "License")  {
        incident = "New License";
      }
      if(incident){
        const timelineDB = await switchDB(companyName, timelineSchemas);
        const timelineModel = await getDBModel(timelineDB, "timeline");
        const timeline = await timelineModel.insertMany(
          [{
            incident: incident,
            employeeUUID: data.employeeUUID,
          }]
        );
      }
    }

    return savedEmployeeInfoHistory;
  }
}

module.exports = new EmployeeInfoHistoryService();
