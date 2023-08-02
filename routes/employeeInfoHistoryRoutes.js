const express = require("express");

const router = express.Router();
const EmployeeInfoHistoryController = require("../controllers/employeeInfoHistoryController");

// Place your user routes here
router.post("/save", EmployeeInfoHistoryController.createEmployeeInfoHistory);
router.put("/update", EmployeeInfoHistoryController.updateEmployeeInfoHistory);
router.get("/fetchByType/:type/:employeeUUID", EmployeeInfoHistoryController.findEmployeeInfoHistoryByType);
router.delete("/delete/:uuid", EmployeeInfoHistoryController.deleteEmployeeInfoHistory);

router.get("/timeline", EmployeeInfoHistoryController.getEmployeeTimeline);

module.exports = router;
