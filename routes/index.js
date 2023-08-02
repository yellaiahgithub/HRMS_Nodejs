const express = require("express");
const { NOT_FOUND } = require("http-status-codes").StatusCodes;
const {
  prometheusMetrix,
} = require("../common/apiHandler/middlewares/prometheus");

const authStrategy = require("../common/authentication/middlewares/authStrategy");
const {
  handleError,
} = require("../common/apiHandler/controllers/request-errorHandler");

const {
  issueSessionRecord,
  terminateSession,
  collectUserSession,
  validateAndUpdateSession,
} = require("../common/authentication/middlewares/session");
const {
    AccessToken,
    validateAccessToken
} = require('../common/authentication/middlewares/accessToken')
const router = express.Router()
const adminRoute = require('./admin')
const sendMailRoute = require('./sendMail')
const customerRoute = require('./customer')
const companyRoute = require('./company')
const loginAdminRoute = require('./loginAdmin')
 
const announcementRoutes = require("../routes/announcementRoutes");
const notificationRoutes = require("../routes/NotificationRoutes");
const resignationRoutes = require("../routes/resignationRoutes");
const resignationApprovalHistoryRoutes = require("../routes/resignationApprovalHistoryRoutes");
const holidayRoutes = require("./holidayRoutes");
const holidayCalendarConfigurationRoutes = require("./holidayCalendarConfigurationRoutes");

const userIdSetupRoute = require("./userIdRoutes");
const locationRoute = require("./location");
const autoNumberingRoute = require("./autoNumbering");
const designationRoute = require("./designationRoutes");
const departmentRoute = require("./departmentRoutes");
const costCenterRoute = require("./costCenterRoutes");
const actionRoute = require("./action");
const reasonRoute = require("./reason");
const employeeRoute = require("./employeeRoutes");
const nationalIdRoute = require("./nationIdRoute");
const moduleAccessRoute = require("./moduleAccessRoutes");
const employeeEmail = require("./employeeEmailRoutes");
const employeePhone = require("./employeePhoneRoutes");
const employeeDependantOrBeneficiary = require("./employeeDependantOrBeneficiaryRoutes");
const storageRoute = require("./storageRoute");
const emergencyContactRoute = require("./emergencyContactRoutes.js");
const addressRoute = require("./addressRoutes.js");

const educationRoute = require("./educationRoutes");
const workExperienceRoute = require("./workExperienceRoutes.js");
const itemCatalogueRoute = require("./itemCatalogueRoutes");
const certificateOrlicenseRoute = require("../routes/certificateOrLicenseRoutes");
const permissionRoute = require("../routes/permissionRoutes");
const roleRoute = require("../routes/roleRoutes");
const uploadResults = require("../routes/uploadResults");
const authRoute = require("../routes/auth");
const passwordRule = require("../routes/passwordRuleRoutes");
const country = require("../routes/countryRoutes");
const bankRoute = require("./bankRoutes.js");
const bankBranchRoute = require("./bankBranchRoutes.js");
const sourceBank = require("./sourceBankRoutes");
const orgChartSetup = require("./orgChartSetupRoutes");
const bulkUpload = require("./bulkUploadRoutes");
const uploadDocument = require("./uploadDocumentRoutes");
const jobBand = require("./jobBandRoutes");
const jobGrade = require("./jobGradeRoutes");
const employeeInfoHistoryRoutes = require("./employeeInfoHistoryRoutes");
const downloadResultsRoutes = require("../routes/downloadResultsRoutes");
const policyRoutes = require("../routes/policyRoutes");
const companyPolicyRoutes = require("../routes/companyPolicyRoutes");
const letterTemplateRoutes = require("./letterTemplateRoutes");
const letterTemplateVariablesRoutes = require("./letterTemplateVariablesRoutes");
const separationControlRoutes = require("./separationControlRoutes");
const probationSetupRoutes = require("./probationSetupRoutes");
const probationControlsetupRoutes = require("./probationControlSetupRoutes");
const holidayCalendarRestrictionsRoutes = require("./holidayCalendarRestrictionsRoutes");
const transactionSummaryRoutes= require('./transactionSummaryRoutes')
const leaveTypeRoutes = require('./leaveTypesRoutes')
const leavePolicyRoutes = require('./leavePolicyRoutes')
const leaveAccumulationPolicyRoutes= require('./leaveAccumulationPolicyRoutes')
const leaveAccrualPolicyRoutes= require('./leaveAccrualPolicyRoutes')
const leaveControlsRoutes= require('./leaveControlsRoutes')

router.post(
  "/logout",
  collectUserSession,
  terminateSession,
  async (req, res, next) => {
    // req.session.destroy();
    res.status(200).json({ message: "logout success" });
  },
  handleError,
  prometheusMetrix
);

router.use("/admin", adminRoute);
router.use('/announcement', collectUserSession, validateAccessToken, validateAndUpdateSession, announcementRoutes)
router.use('/notification', collectUserSession, validateAccessToken, validateAndUpdateSession, notificationRoutes)
router.use('/resignation', collectUserSession, validateAccessToken, validateAndUpdateSession, resignationRoutes)
router.use('/resignationApprovalHistory', collectUserSession, validateAccessToken, validateAndUpdateSession, resignationApprovalHistoryRoutes)
router.use('/holiday', collectUserSession, validateAccessToken, validateAndUpdateSession, holidayRoutes)
router.use('/holidayCalendarConfiguration', collectUserSession, validateAccessToken, validateAndUpdateSession, holidayCalendarConfigurationRoutes)
router.use('/transactionSummary', collectUserSession, validateAccessToken, validateAndUpdateSession, transactionSummaryRoutes)
router.use('/leaveAccumulationPolicy', collectUserSession, validateAccessToken, validateAndUpdateSession, leaveAccumulationPolicyRoutes)
router.use('/leaveAccrualPolicy', collectUserSession, validateAccessToken, validateAndUpdateSession, leaveAccrualPolicyRoutes)
router.use('/leaveControls', collectUserSession, validateAccessToken, validateAndUpdateSession, leaveControlsRoutes)

router.use(
  "/verification",
  authRoute,  
  handleError
);

router.use(
  "/customer",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  customerRoute
);

router.use(
  "/company",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  companyRoute
);

router.use(
  "/location",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  locationRoute
);

router.use(
  "/autoNumbering",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  autoNumberingRoute
);

router.use(
  "/designation",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  designationRoute
);

router.use(
  "/department",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  departmentRoute
);

router.use(
  "/costCenter",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  costCenterRoute
);

router.use(
  "/action",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  actionRoute
);

router.use(
  "/reason",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  reasonRoute
);

router.use(
  "/employee",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  employeeRoute
);

router.use(
  "/nationalId",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  nationalIdRoute
);

router.use(
  "/moduleAccess",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  moduleAccessRoute
);

router.use(
  "/loginAdmin",
  authStrategy,
  issueSessionRecord,
  AccessToken,
  loginAdminRoute
);

router.use(
  "/storage",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  storageRoute
);

router.use(
  "/emergency-contact",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  emergencyContactRoute
);
 
router.use(
  "/userIdSetup",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  userIdSetupRoute
);

router.use(
  "/employeeEmail",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  employeeEmail
);

router.use(
  "/employeePhone",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  employeePhone
);

router.use(
  "/employeeDependantOrBeneficiary",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  employeeDependantOrBeneficiary
);

router.use(
  "/address",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  addressRoute
);

router.use(
  "/education",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  educationRoute
);

router.use(
  "/work-experience",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  workExperienceRoute
);
router.use(
  "/itemCatalogue",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  itemCatalogueRoute
);
router.use(
  "/certificate-license",
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  certificateOrlicenseRoute
)

router.use(
    '/sendMail',
    collectUserSession,
    validateAccessToken,
    validateAndUpdateSession,
    sendMailRoute
)

router.use(
    '/customer',
    collectUserSession,
    validateAccessToken,
    validateAndUpdateSession,
    customerRoute
)

router.use(
  '/permission',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  permissionRoute
)

router.use(
  '/role',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  roleRoute
)

router.use(
  '/uploadResults',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  uploadResults
)

router.use(
  '/password-rule',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  passwordRule
)

router.use(
  '/country',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  country
)

router.use(
  '/bank',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  bankRoute
)

router.use(
  '/bankBranch',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  bankBranchRoute
)
router.use(
  '/sourceBank',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  sourceBank
)

router.use(
  '/orgChartSetup',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  orgChartSetup
)

router.use(
  '/bulkUpload',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  bulkUpload
)

router.use(
  '/upload-document',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  uploadDocument,
)
router.use(
  '/jobBand',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  jobBand
)

router.use(
  '/jobGrade',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  jobGrade
)
router.use(
  '/employeeInfoHistory',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  employeeInfoHistoryRoutes
)
router.use(
  '/downloadResults',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  downloadResultsRoutes
)

router.use(
  '/policy',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  policyRoutes
)

router.use(
  '/companyPolicy',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  companyPolicyRoutes
)
router.use(
  '/letterTemplate',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  letterTemplateRoutes
)
router.use(
  '/letterTemplateVariables',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  letterTemplateVariablesRoutes
)
router.use(
  '/separationControl',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  separationControlRoutes
)
router.use(
  '/probationSetup',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  probationSetupRoutes
)
router.use(
  '/probationControlSetup', collectUserSession, validateAccessToken, validateAndUpdateSession,
  probationControlsetupRoutes
)
router.use(
  '/holidayCalendarRestrictions',
  collectUserSession,
  validateAccessToken,
  validateAndUpdateSession,
  holidayCalendarRestrictionsRoutes
)

router.use(
  '/leaveType', collectUserSession, validateAccessToken, validateAndUpdateSession,
  leaveTypeRoutes
)
router.use(
  '/leavePolicy', collectUserSession, validateAccessToken, validateAndUpdateSession,
  leavePolicyRoutes
)

router.use((req, res) => {
  res
    .status(NOT_FOUND)
    .send({ message: "Not found.", status: NOT_FOUND, success: false });
});
router.use(prometheusMetrix);
module.exports = router;
