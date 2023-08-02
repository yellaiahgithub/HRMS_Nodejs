const express = require("express");

const router = express.Router();
const HolidayController = require("../controllers/HolidayController");

// Place your user routes here
router.post("/", HolidayController.createHoliday);
router.get("/fetchAll", HolidayController.findAll);

module.exports = router;
