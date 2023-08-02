const express = require('express')

const router = express.Router()
const EmployeeEmailController = require('../controllers/employeeEmailController')

// Place your user routes here
router.post('/save', EmployeeEmailController.createEmployeeEmail)
router.post("/saveAll", EmployeeEmailController.createAllEmployeeEmails);
router.put('/update', EmployeeEmailController.updateEmployeeEmail)
router.get('/fetchByEmployeeUUID/:employeeUUID', EmployeeEmailController.findEmployeeEmailByEmployeeId)
router.delete('/delete/:uuid', EmployeeEmailController.deleteEmployeeEmail)
router.get("/CSVHeader", EmployeeEmailController.generateCSVHeader);

module.exports = router
