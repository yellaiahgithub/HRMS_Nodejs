const express = require("express");

const router = express.Router();
const JobBandController = require("../controllers/jobBandController");

// Place your user routes here
router.post("/save", JobBandController.createJobBand);
router.post("/saveAll", JobBandController.createAllJobBands);
router.put("/update", JobBandController.updateJobBand);
router.get("/fetchByBandId/:bandId", JobBandController.findJobBandById);
router.get("/fetchAll", JobBandController.findAll);
router.get("/fetchAllLite", JobBandController.findAllLite);
router.get("/search", JobBandController.searchJobBand);
router.get("/CSVHeader", JobBandController.generateCSVHeader);

module.exports = router;
