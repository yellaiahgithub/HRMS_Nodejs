const express = require("express");

const router = express.Router();
const JobGradeController = require("../controllers/jobGradeController");

// Place your user routes here
router.post("/save", JobGradeController.createJobGrade);
router.put("/update", JobGradeController.updateJobGrade);
router.get("/fetchBy", JobGradeController.findJobGradeBy);
router.get("/fetchAll", JobGradeController.findAll);
router.get("/fetchAllLite", JobGradeController.findAllLite);

router.post("/saveAll", JobGradeController.createAllJobGrades);
router.get("/CSVHeader", JobGradeController.generateCSVHeader);

module.exports = router;
