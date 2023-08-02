const express = require("express");

const router = express.Router();
const SeparationControlController = require("../controllers/separationControlController");

// Place your user routes here
router.post("/save", SeparationControlController.createSeparationControl);
router.put("/update", SeparationControlController.updateSeparationControl);
router.get("/fetch", SeparationControlController.find);
router.get("/fetchNoticePeriordDetailsByEmployeeUUID/:employeeUUID", SeparationControlController.fetchNoticePeriordDetailsByEmployeeUUID);

module.exports = router;
