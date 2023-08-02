const mongoose = require("mongoose");
const sessionModel = require("../models/SessionModel");
const connectDB = require("./connectDB");
const announcementModel = require("../models/announcement");
const designationModel = require("../models/designation");
const adminModel = require("../models/admin");
const customerModel = require("../models/customer");
const companyModel = require("../models/company");
const locationModel = require("../models/locations");
const autoNumberingModel = require("../models/autoNumbering");
const actionModel = require("../models/actions");
const reasonModel = require("../models/reasons");
const costCenterModel = require("../models/costCenter");
const departmentModel = require("../models/department");
const employeeModel = require("../models/employee");
const nationalIdModel = require("../models/nationId");
const moduleAccessModel = require("../models/moduleAccess.js");
const emergencyContactModel = require("../models/emergencyContact");
const UploadModel = require("../models/UploadModel");
const employeePhoneModel = require("../models/employeePhone");
const employeeEmailModel = require("../models/employeeEmail");
const employeeDependantOrBeneficiaryModel = require("../models/employeeDependantOrBeneficiary");
const userIdSetupModel = require("../models/userIdSetup");
const addressModel = require('../models/address')
const educationModel = require('../models/educations');
const workExperienceModel = require('../models/workExperience.js');
const certificateOrlicenseModel = require('../models/certificateOrLicense.js');
const permissionModel = require('../models/permission.js');
const roleModel = require('../models/role.js');
const itemCatalogueModel = require("../models/itemCatalogue");
const uploadResultsModel = require("../models/uploadResults");
const passwordRuleModel = require("../models/passwordRule");
const countryModel = require("../models/country");
const bankModel = require("../models/bank.js");
const bankBranchModel = require("../models/bankBranch.js");
const sourceBankModel = require("../models/sourceBank");
const orgChartSetupModel = require("../models/orgChartSetup");
const jobBandModel = require("../models/jobBand");
const jobGradeModel = require("../models/jobGrade");
const employeeInfoHistoryModel = require("../models/employeeInfoHistory");
const downloadResultsModel = require("../models/downloadResults");
const policyModel = require("../models/policy");
const companyPolicyModel = require("../models/companyPolicy");
const notificationModel = require("../models/notificationModel");
const mailNotificationModel = require("../models/mailNotificationModel");
const timelineModel = require("../models/TimelineModel");
const letterTemplateModel = require("../models/letterTemplate");
const letterTemplateVariablesModel = require("../models/letterTemplateVariables");
const resignationModel = require("../models/resignation");
const resignationApprovalHistoryModel=require("../models/resignationApprovalHistory");
const holidayModel = require("../models/holiday");
const separationControlModel = require("../models/separationControl");
const holidayCalendarConfigurationModel = require("../models/holidayConfiguration");
const probationSetupModel = require("../models/probationSetup");
const holidayCalendarRestrictionsModel = require("../models/holidayCalendarRestrictions");
const transactionSummaryModel = require("../models/transactionSummary");
const probationControlSetupModel = require("../models/probationControlSetup");
const resetPasswordTokenModel = require("../models/ResetPasswordToken");
const leaveTypeModel = require("../models/leaveType");
const leavePolicyModel = require("../models/leavePolicy");
const leaveAccumulationPolicyModel = require("../models/leaveAccumulationPolicy");
const leaveAccrualPolicyModel = require("../models/leaveAccrualPolicy");
const leaveControlsModel = require("../models/leaveControls");

// Indicates which Schemas are used by whom
const sessionMongoSchema =  new Map([['sessions', sessionModel]]);
const announcementSchema = new Map([['announcement', announcementModel]]);
const designationSchemas = new Map([['designation', designationModel]]);
const companySchemas = new Map([['company', companyModel]]);
const adminSchema =  new Map([['admin', adminModel]]);
const customerSchema =  new Map([['customer', customerModel]]);
const locationSchemas = new Map([['locations', locationModel]])
const autoNumberingSchemas = new Map([['autoNumbering', autoNumberingModel]])
const actionSchemas = new Map([['action', actionModel]])
const reasonSchemas = new Map([['reason', reasonModel]])
const costCenterSchema = new Map([['costCenter', costCenterModel]])
const departmentSchema = new Map([['department', departmentModel]])
const employeeSchema = new Map([['employee', employeeModel]])
const nationIDSchema = new Map([['nationID', nationalIdModel]])
const moduleAccessSchema = new Map([['moduleAccess', moduleAccessModel]])
const emergencyContactSchema = new Map([['emergencyContact', emergencyContactModel]])
const uploadedFilesSchema = new Map([['uploadedFiles', UploadModel]])
const educationSchema = new Map([['education', educationModel]])
const workExperienceSchema = new Map([['workExperience', workExperienceModel]])
const employeePhoneSchema = new Map([['employeePhone', employeePhoneModel]])
const employeeEmailSchema = new Map([['employeeEmail', employeeEmailModel]])
const userIdSetupSchema = new Map([['userIdSetup', userIdSetupModel]])
const certificateOrlicenseSchema = new Map([['certificateOrlicense', certificateOrlicenseModel]])
const permissionsSchema = new Map([['permissions', permissionModel]])
const rolesSchema = new Map([['roles', roleModel]])
const employeeDependantOrBeneficiarySchema = new Map([
  ["employeeDependantOrBeneficiary", employeeDependantOrBeneficiaryModel],
]);
const timelineSchemas = new Map([['timeline', timelineModel]])
const probationControlSetupSchema = new Map([['probationControlSetup', probationControlSetupModel]])

const addressSchema = new Map([["address", addressModel]]);
const itemCatalogueSchema = new Map([["itemCatalogue", itemCatalogueModel]]);
const uploadResultsSchema = new Map([["uploadResults", uploadResultsModel]]);
const passwordRuleSchema = new Map([["passwordRule", passwordRuleModel]]);

const countrySchema = new Map([["country", countryModel]]);
const bankSchema = new Map([["bank",bankModel]]);
const bankBranchSchema = new Map([["bankBranch", bankBranchModel]]);
const sourceBankSchema = new Map([["sourceBank", sourceBankModel]]);
const orgChartSetupSchema = new Map([["orgChartSetup", orgChartSetupModel]]);
const jobBandSchema = new Map([["jobBand", jobBandModel]]);
const jobGradeSchema = new Map([["jobGrade", jobGradeModel]]);
const employeeInfoHistorySchema = new Map([["employeeInfoHistory", employeeInfoHistoryModel]]);
const downloadResultsSchema = new Map([["downloadResults", downloadResultsModel]]);
const policySchema = new Map([["policy", policyModel]]);
const companyPolicySchema = new Map([["companyPolicy", companyPolicyModel]]);
const notificationSchema = new Map([["notification", notificationModel]]);
const mailNotificationSchema = new Map([["mailNotifications", mailNotificationModel]]);
const letterTemplateSchema = new Map([["letterTemplate", letterTemplateModel]]);
const letterTemplateVariablesSchema = new Map([["letterTemplateVariables", letterTemplateVariablesModel]]);
const resignationSchema = new Map([["resignation", resignationModel]]);
const resignationApprovalHistorySchema = new Map([["resignationApprovalHistory", resignationApprovalHistoryModel]]);
const holidaySchema = new Map([["holiday", holidayModel]]);
const separationControlSchema = new Map([["separationControl", separationControlModel]]);
const probationSetupSchema = new Map([["probationSetup", probationSetupModel]]);
const holidayCalendarConfigurationSchema = new Map([["holidayCalendarConfiguration", holidayCalendarConfigurationModel]]);
const holidayCalendarRestrictionsSchema = new Map([["holidayCalendatRestrictions", holidayCalendarRestrictionsModel]]);
const transactionSummarySchema = new Map([["transactionSummary", transactionSummaryModel]]);
const  resetPasswordToken = new Map([["resetPasswordToken", resetPasswordTokenModel]]);
const leaveTypeSchemas = new Map([["leaveType", leaveTypeModel]])
const leavePolicySchema = new Map([["leavePolicy", leavePolicyModel]])
const  leaveAccumulationPolicySchema = new Map([["leaveAccumulationPolicy", leaveAccumulationPolicyModel]]);
const  leaveAccrualPolicySchema = new Map([["leaveAccrualPolicy", leaveAccrualPolicyModel]]);
const  leaveControlsSchema = new Map([["leaveControls", leaveControlsModel]]);

/** Switch db on same connection pool
 * @return new connection
 */
const switchDB = async (dbName, dbSchema) => {
    
  const mongoose = await connectDB();
  //mongoose.connection.close();
  if (mongoose.connection.readyState === 1) {
    console.log("Switched to DB", dbName);
    const db = mongoose.connection.useDb(dbName, { useCache: false });
    // Prevent from schema re-registration
    if (!Object.keys(db.models).length) {
      dbSchema.forEach((schema, modelName) => {
        db.model(modelName, schema);
      });
    }
    return db;
  }
  throw new Error("error");
};

/**
 * @return model from mongoose
 */
const getDBModel = async (db, modelName) => {
  return db.model(modelName);
};

module.exports = { switchDB, getDBModel, sessionMongoSchema, announcementSchema, designationSchemas,  companySchemas,
  adminSchema, customerSchema, locationSchemas, autoNumberingSchemas, userIdSetupSchema,
  resignationSchema,resignationApprovalHistorySchema,
  holidaySchema, holidayCalendarConfigurationSchema,
  actionSchemas, reasonSchemas, costCenterSchema, departmentSchema, employeeSchema, nationIDSchema, emergencyContactSchema, resetPasswordToken,
  uploadedFilesSchema,educationSchema, workExperienceSchema, employeePhoneSchema, employeeEmailSchema, employeeDependantOrBeneficiarySchema, addressSchema,
  certificateOrlicenseSchema, permissionsSchema, rolesSchema, itemCatalogueSchema, uploadResultsSchema, moduleAccessSchema,
  passwordRuleSchema, countrySchema, bankSchema,  bankBranchSchema, sourceBankSchema, orgChartSetupSchema, jobBandSchema, jobGradeSchema, employeeInfoHistorySchema,
  downloadResultsSchema, policySchema, companyPolicySchema, notificationSchema, mailNotificationSchema, timelineSchemas,letterTemplateSchema,letterTemplateVariablesSchema,
  separationControlSchema, probationSetupSchema, probationControlSetupSchema, holidayCalendarRestrictionsSchema, transactionSummarySchema,
  leaveTypeSchemas, leavePolicySchema, leaveAccumulationPolicySchema, leaveAccrualPolicySchema, leaveControlsSchema }

