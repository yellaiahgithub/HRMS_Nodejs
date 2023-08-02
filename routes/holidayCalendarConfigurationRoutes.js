const express = require("express");

const router = express.Router();
const holidayCalendarConfigurationController = require("../controllers/HolidayCalendarConfigurationController");

// Place your user routes here
router.post("/", holidayCalendarConfigurationController.createHolidayCalendarConfiguration);
router.get("/byId", holidayCalendarConfigurationController.findById);
router.post("/fetchAll", holidayCalendarConfigurationController.findAll); // api can filter by [year] and [location]
router.patch("/update", holidayCalendarConfigurationController.update);
router.get("/employee", holidayCalendarConfigurationController.getEmployeeByLocation);

module.exports = router;
