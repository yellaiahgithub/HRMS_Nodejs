const { getListFromConstant } = require("../utils/commonUtils");
const { LEAVE_ACCRUAL_POLICY_ENUM, LEAVE_ACCUMULATION_POLICY_ENUM } = require("./enumConstants");

exports.CORE_HR_ADMIN="Core HR Admin";
exports.ACTION={HIRE:"HIRE",SEPERATION:"SEP"}
exports.EMPLOYEE_HISTORY_TYPE={JOB_DETAILS:"EmployeeJobDetails",}
exports.MAIL_NOTIFICATION_TYPE={
    HIRE: "Hire",                                                   //integrated
    CREATE_USER_ID: "Create User ID",                               //integrated
    UPDATE_HIRE_INFO: "Update Hire Info",                           //integrated
    UPDATE_BIOGRAPHICAL_DETAILS: "Update Biographical Details",     //integrated
    ADD_ADDRESS: "Add Address",                                     //integrated
    UPDATE_ADDRESS: "Update Address",                               //integrated
    DELETE_ADDRESS: "Delete Address",                               //integrated
    ADD_NATIONAL_ID: "Add National ID",                             //integrated
    UPDATE_NATIONAL_ID: "Update National ID",                       //integrated
    DELETE_NATIONAL_ID: "Delete National ID",                       //integrated
    ADD_EMERGENCY_CONTACT: "Add Emergency Contact",                 //integrated
    UPDATE_EMERGENCY_CONTACT: "Update Emergency Contact",           //integrated
    DELETE_EMERGENCY_CONTACT: "Delete Emergency Contact",           //integrated
    ADD_DEPENDENT: "Add Dependant",                                 //integrated
    UPDATE_DEPENDENT: "Update Dependant",                           //integrated
    DELETE_DEPENDENT: "Delete Dependant",                           //integrated
    ADD_BENEFICIARY: "Add Beneficiary",                             //integrated
    UPDATE_BENEFICIARY: "Update Beneficiary",                       //integrated
    DELETE_BENEFICIARY: "Delete Beneficiary",                       //integrated
    ADD_PRIOR_WORK_EXPERIENCE: "Add Prior Work Experience",         //integrated
    UPDATE_PRIOR_WORK_EXPERIENCE: "Update Prior Work Experience",   //integrated
    DELETE_PRIOR_WORK_EXPERIENCE: "Delete Prior Work Experience",   //integrated
    ADD_PHONE: "Add Phone",                                         //integrated
    UPDATE_PHONE: "Update Phone",                                   //integrated
    DELETE_PHONE: "Delete Phone",                                   //integrated
    ADD_EMAIL: "Add Email",                                         //integrated
    UPDATE_EMAIL: "Update Email",                                   //integrated
    DELETE_EMAIL: "Delete Email",                                   //integrated
    ADD_CERTIFICATE: "Add Certificate",                             //integrated
    UPDATE_CERTIFICATE: "Update Certificate",                       //integrated
    DELETE_CERTIFICATE: "Delete Certificate",                       //integrated
    ADD_LICENSE: "Add License",                                     //integrated
    UPDATE_LICENSE: "Update License",                               //integrated
    DELETE_LICENSE: "Delete License",                               //integrated
    RESET_PASSWORD_BY_ADMIN: "Reset Password (Admin)",              //integrated
    RESET_PASSWORD_BY_SELF: "Reset Password (Self)",                //integrated
    LOCK_ACCOUNT: "Lock Account",                                   //integrated
    UNLOCK_ACCOUNT: "Unlock Account",                               //integrated
    MODIFY_ROLES: "Modify Roles",                                                   //hold
    EDIT_PERSONAL_DETAILS: "Edit Personal Details",                 //integrated
    EDIT_JOB_DETAILS: "Edit Job Details",                           //integrated
    PUBLISH_COMPANY_NEWS: "Publish Company News",                   //integrated
    EMPLOYEE_SUBMITS_RESIGNATION: "Employee Submits Resignation",   //integrated
    EMPLOYEE_CANCELS_RESIGNATION: "Employee Cancels Resignation",   //integrated
    MANAGER_APPROVES_RESIGNATION: "Manager Approves Resignation",   //integrated
    MANAGER_REJECTS_RESIGNATION: "Manager Rejects Resignation",     //integrated
    L2_APPROVES_RESIGNATION: "L2 Approves Resignation",             //integrated
    L2_REJECTS_RESIGNATION: "L2 Rejects Resignation",               //integrated
    L3_APPROVES_RESIGNATION: "L3 Approves Resignation",             //integrated
    L3_REJECTS_RESIGNATION:"L3 Rejects Resignation",                //integrated
    ROLE_APPROVES_RESIGNATION: "Role Approves Resignation",         //integrated
    ROLE_REJECTS_RESIGNATION: "Role Rejects Resignation",           //integrated
    ADMIN_APPROVES_RESIGNATION: "Admin Approves Resignation",       //integrated
    ADMIN_REJECTS_RESIGNATION: "Admin Rejects Resignation",         //integrated
    MANAGER_PROXY_RESIGNATION_SUBMISSION: "Manager Proxy Resignation Submission",   //integrated
    ADMIN_PROXY_RESIGNATION_SUBMISSION: "Admin Proxy Resignation Submission",       //integrated
}
exports.MAIL_RECEPIENTS={INITIATOR:"Initiator", INITIATORS_L1:"Initiator’s L1", INITIATORS_L2:"Initiator’s L2",BENEFACTOR:"Benefactor",BENEFACTORS_DEPARTMENT:"Benefactor’s Department",BENEFACTORS_LOCATION:"Benefactor’s Location", ROLE:"Role",DESIGNATION:"Designation"}

//LEAVE_ACCRUAL_POLICY
exports.LEAVEACCRUALPOLICY_RULES_ELIGIBLELEAVE_UNIT_LIST=getListFromConstant(LEAVE_ACCRUAL_POLICY_ENUM.RULES.ELIGIBLE_LEAVE.UNIT)
exports.LEAVEACCRUALPOLICY_RULES_ACCRUALAFTER_UNIT_LIST=getListFromConstant(LEAVE_ACCRUAL_POLICY_ENUM.RULES.ACCRUAL_AFTER.UNIT)
exports.LEAVEACCRUALPOLICY_RULES_ACCRUALFREQUENCY_LIST=getListFromConstant(LEAVE_ACCRUAL_POLICY_ENUM.RULES.ACCRUAL_FREQUENCY)
exports.LEAVEACCRUALPOLICY_ACCRUALCRITERIA_LIST=getListFromConstant(LEAVE_ACCRUAL_POLICY_ENUM.ACCRUAL_CRITERIA)

//LEAVE_ACCUMULATION_POLICY
exports.LEAVEACCUMULATIONPOLICY_RULES_CARRYFORWARDLIMIT_UNIT_LIST=getListFromConstant(LEAVE_ACCUMULATION_POLICY_ENUM.RULES.CARRY_FORWARD_LIMIT.UNIT)
exports.LEAVEACCUMULATIONPOLICY_RULES_ACCUMULATIONLIMIT_UNIT_LIST=getListFromConstant(LEAVE_ACCUMULATION_POLICY_ENUM.RULES.ACCUMULATION_LIMIT.UNIT)

