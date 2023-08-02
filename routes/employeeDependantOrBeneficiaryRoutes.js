const express = require('express')

const router = express.Router()
const EmployeeDependantOrBeneficiaryController = require('../controllers/employeeDependantOrBeneficiaryController')

// Place your user routes here
router.post('/save', EmployeeDependantOrBeneficiaryController.createEmployeeDependantOrBeneficiary)
router.post("/saveAllDependants", EmployeeDependantOrBeneficiaryController.createAllDependants);
router.post("/saveAllBeneficiaries", EmployeeDependantOrBeneficiaryController.createAllBeneficiaries);
router.put('/update', EmployeeDependantOrBeneficiaryController.updateEmployeeDependantOrBeneficiary)
router.get('/fetchByEmployeeUUID/:employeeUUID', EmployeeDependantOrBeneficiaryController.findEmployeeDependantOrBeneficiaryByEmployeeId)
//send relationWithEmployee as query param with key 'relation' for Dependant
router.delete('/delete/:employeeUUID/:type/:name', EmployeeDependantOrBeneficiaryController.deleteEmployeeDependantOrBeneficiary)
router.get("/dependantCSVHeader", EmployeeDependantOrBeneficiaryController.generateDependantCSVHeader);
router.get("/beneficiaryCSVHeader", EmployeeDependantOrBeneficiaryController.generateBeneficiaryCSVHeader);
router.delete('/delete/:employeeUUID/:type/:name', EmployeeDependantOrBeneficiaryController.deleteEmployeeDependantOrBeneficiary)

module.exports = router
