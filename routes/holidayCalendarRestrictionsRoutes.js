const express = require("express");

const router = express.Router();
const HolidayCalendarRestrictionsController = require("../controllers/holidayCalendarRestrictionsController");

// Place your user routes here
router.post("/", HolidayCalendarRestrictionsController.create);
router.get("/", HolidayCalendarRestrictionsController.find);
router.patch("/update", HolidayCalendarRestrictionsController.update);

module.exports = router;
