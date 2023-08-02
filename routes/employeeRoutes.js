const express = require("express");

const router = express.Router();
const EmployeeController = require("../controllers/employeeController");

// Place your user routes here
router.post('/save', EmployeeController.createEmployee)
router.put('/update', EmployeeController.updateEmployee)
router.get('/get-all-employees', EmployeeController.findAll)
router.get('/get-all-employees/lite', EmployeeController.findAllLite)
router.get('/employee-detail/:id', EmployeeController.findEmployeeById)
//use 'id','userId','isActive','uuid' as query params for filter conditions
router.get('/employee-details', EmployeeController.getEmployeeDetail)

router.get('/get-employee-by-id/:id', EmployeeController.findEmployeeById)
router.get('/fetchEmployeesWithOutUserId', EmployeeController.findEmployeesWithOutUserIds)
router.post('/generateUserIds', EmployeeController.generateUserIds)
router.delete('/:uuid', EmployeeController.deleteEmployeeById)
//pass 'userId' or 'id' or 'isActive' or 'uuid' as query params
router.get("/fetchEmployeeByUserId", EmployeeController.findEmployeeDetails);

router.patch("/assignRole", EmployeeController.assignRole);
router.patch("/unAssignRole", EmployeeController.unAssignRole);

router.post("/filter", EmployeeController.filterEmployees);

router.post('/fetchEmployeesCredentialStatus', EmployeeController.fetchEmployeeCredentialStatus )
//API - View Org Structure
router.post('/fetchEmployeesHirarchy', EmployeeController.fetchEmployeesHirarchy )

router.post('/uploadEmployee', EmployeeController.uploadEmployee)
router.get("/CSVHeader", EmployeeController.generateCSVHeader);
router.get("/managerUpload/CSVHeader", EmployeeController.getManagerUploadCSVHeader);
router.post('/uploadUpdateEmployee', EmployeeController.updateAllEmployee)
router.get("/fetchBirthDatesOrAnniversaries", EmployeeController.getEmployeesByBirthDateOrHireDate);

router.get('/fetchEmployeesTeam', EmployeeController.fetchEmployeesTeam )
router.post('/probationConfirmation', EmployeeController.updateProbationConfirmation )
router.get('/fetchProbationEmployee', EmployeeController.fetchProbationEmployee )
router.post('/attrition', EmployeeController.attritionEmployees )


router.get('/nonDirectInDirectEmployees/:uuid', EmployeeController.fetchNonDirectIndirectEmployees )

module.exports = router;
