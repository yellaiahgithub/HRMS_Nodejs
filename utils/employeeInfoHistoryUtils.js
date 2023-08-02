var moment = require("moment"); // require

class EmployeeInfoHistoryUtils {
  constructor() {}

  validateEmployeeInfoHistory = async (employeeInfoHistoryData, req, allEmployees=[]) => {
    let errors = [];
    if (employeeInfoHistoryData.effectiveDate == null) {
      errors.push("Effective Date can not be empty");
    } else if (!moment(employeeInfoHistoryData.effectiveDate).isValid()) {
      errors.push("Invalid Effective Date");
    }

    //EmployeeName Validations
    if (
      employeeInfoHistoryData.type.toLowerCase() == "EmployeeName".toLowerCase()
    ) {
      if (
        employeeInfoHistoryData.historyObject.firstName == null ||
        employeeInfoHistoryData.historyObject.firstName.length == 0
      ) {
        errors.push("First Name can not be empty");
      }
    }

    //EmployeeJobDetails Validations
    if (
      employeeInfoHistoryData.type.toLowerCase() ==
      "EmployeeJobDetails".toLowerCase()
    ) {
      if (
        employeeInfoHistoryData.historyObject.jobType == null ||
        employeeInfoHistoryData.historyObject.jobType.length == 0
      ) {
        errors.push("Job Type can not be empty");
      }
      if (
        employeeInfoHistoryData.historyObject.jobStatus == null ||
        employeeInfoHistoryData.historyObject.jobStatus.length == 0
      ) {
        errors.push("Job Status can not be empty");
      }
      if (employeeInfoHistoryData.historyObject.hireDate == null) {
        errors.push("Hire Date can not be empty");
      } else if (
        !moment(employeeInfoHistoryData.historyObject.hireDate).isValid()
      ) {
        errors.push("Invalid Hire Date");
      }
      if (
        employeeInfoHistoryData.historyObject.department == null ||
        employeeInfoHistoryData.historyObject.department.length == 0
      ) {
        errors.push("Department can not be empty");
      }
      if (
        employeeInfoHistoryData.historyObject.location == null ||
        employeeInfoHistoryData.historyObject.location.length == 0
      ) {
        errors.push("Location can not be empty");
      }
      if (
        employeeInfoHistoryData.historyObject.designation == null ||
        employeeInfoHistoryData.historyObject.designation.length == 0
      ) {
        errors.push("Designation can not be empty");
      }
      if (
        employeeInfoHistoryData.historyObject.managerUUID == null ||
        employeeInfoHistoryData.historyObject.managerUUID.length == 0
      ) {
        errors.push("Manager can not be empty");
      }
      if (
        employeeInfoHistoryData.historyObject.action == null ||
        employeeInfoHistoryData.historyObject.action.length == 0
      ) {
        errors.push("Action can not be empty");
      }
      if (
        employeeInfoHistoryData.historyObject.actionReason == null ||
        employeeInfoHistoryData.historyObject.actionReason.length == 0
      ) {
        errors.push("Action Reason can not be empty");
      }

      if(employeeInfoHistoryData?.historyObject.managerUUID == employeeInfoHistoryData?.employeeUUID) {
        throw new Error("Employee can't be his manager");
      }

      if(employeeInfoHistoryData.historyObject.managerUUID) {
          const reportees = allEmployees.find(m =>m.uuid == employeeInfoHistoryData?.employeeUUID);  
          if(reportees && reportees.find(r =>r?.uuid == employeeInfoHistoryData.historyObject.managerUUID)) {
          throw new Error("Reporter can't be Employee's Manager");
          }
      }


    }
    return errors;
  };
}
module.exports = new EmployeeInfoHistoryUtils();
