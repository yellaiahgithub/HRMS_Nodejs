const express = require("express");

const router = express.Router();
const ResignationController = require("../controllers/resignationController");

// Place your user routes here
router.post("/save", ResignationController.createResignation);
router.put("/update", ResignationController.editResignation);
router.get("/fetch", ResignationController.find);
router.get("/fetchByUUID/:uuid", ResignationController.findResignationByUUID);
router.get("/fetchByEmployeeUUID/:employeeUUID", ResignationController.findResignationByEmployeeUUID);
router.get("/fetchEmployeeHistory/:employeeUUID", ResignationController.findResignationHistoryByEmployeeUUID);
router.get("/fetchByApproverUUID/:approverUUID", ResignationController.findResignationByApproverUUID);
router.put("/cancel/:uuid", ResignationController.cancelResignation);
router.get("/fetchForTransactionSummary/:uuid", ResignationController.findResignationDetailsForTransactionSummary);

module.exports = router;
