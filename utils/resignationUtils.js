const { v4: uuidv4 } = require("uuid");
const {
  switchDB,
  getDBModel,
  employeeInfoHistorySchema,
  employeeSchema,
  actionSchemas,
} = require("../middlewares/switchDB");
const transactionSummaryService = require("../services/transactionSummaryService");
const { generateMail } = require("./mailNotificationUtils");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");

const approvalCriterias = {
  empReg: "Employee’s regular exit request",
  empEar: "Employee’s early exit request",
  manReg: "Manager’s Proxy regular exit request",
  manEar: "Manager’s Proxy early exit request",
  admReg: "Admin’s Proxy regular exit request",
  admEar: "Admin’s Proxy early exit request",
  all: "All Criterias",
};

class RegistrationUtils {
  constructor() {}

  getApproverCriteria = (resignationRequest, approvalPath) => {
    let approverList = [];
    let approvalCriteria;
    if (resignationRequest.submittedBy.toLowerCase() === "Employee".toLowerCase())
      approvalCriteria = resignationRequest.isEarlyExit ? approvalCriterias.empEar: approvalCriterias.empReg;
    if (resignationRequest.submittedBy.toLowerCase() === "Manager".toLowerCase())
      approvalCriteria = resignationRequest.isEarlyExit ? approvalCriterias.manEar : approvalCriterias.manReg;
    if (resignationRequest.submittedBy.toLowerCase() === "Admin".toLowerCase())
      approvalCriteria = resignationRequest.isEarlyExit ? approvalCriterias.admEar : approvalCriterias.admReg;
    approverList = approvalPath.filter((temp) =>temp.criteria.toLowerCase() === approvalCriteria.toLowerCase() || temp.criteria.toLowerCase() === approvalCriterias.all.toLowerCase());
    return approverList.sort((a, b) => a.level - b.level);
  };
  generateResignationHistoryObject=(approvalCriteria,approverUUID,resignationUUID)=>{
    return {
      uuid: uuidv4(),
      resignationUUID: resignationUUID,
      approvalStatus: null,
      //find approvar UUID from employee collection
      approverUUID: approverUUID,
      levelOfApprover: approvalCriteria.level,
      approver: approvalCriteria.approver,
      isDirectEmployee: approvalCriteria.approver.toLowerCase()==="Reporting Manager".toLowerCase(),
      isActive: true,
      comments: null,
      acceptanceCriteria: null,
      relievingDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  createTransactionSummary=async(resignationData,req)=>{
    const transactionSummaryData={
      uuid:uuidv4(),
      requestUUID:resignationData.uuid,
      employeeUUID:resignationData.employeeUUID,
      requestType:"Resignation",
      requestedDate: new Date(),
      isActive:true,
      status:"Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return await transactionSummaryService.createTransactionSummary(transactionSummaryData,req);
  }

  updateTransactionSummary=async(resignationData,req,status)=>{
    const transactionSummaryData={
      requestUUID:resignationData.uuid,
      employeeUUID:resignationData.employeeUUID,
      status:status,
      updatedAt: new Date(),
    }
    if(status=='Approved'){
      await this.addSeparationRecord(resignationData.employeeUUID,resignationData.reasonCode,resignationData.lastWorkingDate,req)
    }
    return await transactionSummaryService.updateTransactionSummary(transactionSummaryData,req);
  }

  addSeparationRecord=async (employeeUUID,resaon,lastWorkingDate,req)=>{
    const companyName = req.subdomain;
    const employeeDB = await switchDB(companyName, employeeSchema);
    const employeeModel = await getDBModel(employeeDB, "employee");
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
    const employeeData = await employeeModel.findOne({uuid: employeeUUID}).lean()
    const data={
      uuid:uuidv4(),
      employeeUUID:employeeUUID,
      name:'CREATE',
      type:'EmployeeJobDetails',
      effectiveDate:lastWorkingDate,
      reason:"Resignation Approved",
      historyObject:{
        jobType: employeeData.jobType,
        jobStatus: employeeData.jobStatus,
        hireDate: employeeData.hireDate,
        department: employeeData.department,
        location: employeeData.location,
        designation: employeeData.designation,
        managerUUID: employeeData.managerUUID,
        action:seperateAction.actionCode,
        actionReason:resaon
      },
      createdAt:new Date(),
      updatedAt:new Date()
    }
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
  }
  sendMails(historyObj,resignationObj){
    const inputObj=historyObj;
    const obj={benefactorUUIDs:[resignationObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
    if(historyObj.approver.toLowerCase() === "Admin".toLowerCase()){
      if(historyObj.approvalStatus == "Approved") generateMail(MAIL_NOTIFICATION_TYPE.ADMIN_APPROVES_RESIGNATION,obj,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.ADMIN_REJECTS_RESIGNATION,obj,req,inputObj)
    }
    else if(historyObj.approver.toLowerCase() === "Reporting Manager".toLowerCase()){
      if(historyObj.approvalStatus == "Approved") generateMail(MAIL_NOTIFICATION_TYPE.MANAGER_APPROVES_RESIGNATION,obj,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.MANAGER_REJECTS_RESIGNATION,obj,req,inputObj)
    }
    else if(historyObj.approver.toLowerCase() === "L2 Manager".toLowerCase()){
      if(historyObj.approvalStatus == "Approved") generateMail(MAIL_NOTIFICATION_TYPE.L2_APPROVES_RESIGNATION,obj,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.L2_REJECTS_RESIGNATION,obj,req,inputObj)
    }
    else if(historyObj.approver.toLowerCase() === "L3 Manager".toLowerCase()){
      if(historyObj.approvalStatus == "Approved") generateMail(MAIL_NOTIFICATION_TYPE.L3_APPROVES_RESIGNATION,obj,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.L3_REJECTS_RESIGNATION,obj,req,inputObj)
    }
    else if(historyObj.approver.toLowerCase() === "ROLE".toLowerCase()){
      if(historyObj.approvalStatus == "Approved") generateMail(MAIL_NOTIFICATION_TYPE.ROLE_APPROVES_RESIGNATION,obj,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.ROLE_REJECTS_RESIGNATION,obj,req,inputObj)
    }
  }
}
module.exports = new RegistrationUtils();
