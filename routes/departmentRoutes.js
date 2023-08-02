const express = require("express");

const router = express.Router();
const DepartmentController = require("../controllers/departmentController");

// Place your user routes here
router.post("/save", DepartmentController.createDepartment);
router.post("/saveAll", DepartmentController.createAllDepartments);
router.put("/update", DepartmentController.updateDepartment);
router.get("/fetchAll", DepartmentController.findAll);
router.get("/fetchAllLite", DepartmentController.findAllLite);
router.get("/byId/:id", DepartmentController.findDepartmentById);
router.get("/byName/:name", DepartmentController.findDepartmentByName);
router.get("/CSVHeader", DepartmentController.generateCSVHeader);

module.exports = router;
