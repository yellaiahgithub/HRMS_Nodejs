const express = require('express')

const router = express.Router()
const EmployeePhoneController = require('../controllers/employeePhoneController')

// Place your user routes here
router.post('/save', EmployeePhoneController.createEmployeePhone)
router.post("/saveAll", EmployeePhoneController.createAllEmployeePhones);
router.put('/update', EmployeePhoneController.updateEmployeePhone)
router.get('/fetchByEmployeeUUID/:employeeUUID', EmployeePhoneController.findEmployeePhoneByEmployeeId)
router.delete('/delete/:uuid', EmployeePhoneController.deleteEmployeePhone)
router.get("/CSVHeader", EmployeePhoneController.generateCSVHeader);

module.exports = router
