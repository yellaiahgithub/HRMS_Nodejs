const express = require('express')

const router = express.Router()
const EmergencyContactController = require('../controllers/emergencyContactController.js')

// Place your user routes here
router.post('/', EmergencyContactController.create)
router.get('/employeeUUID/:employeeUUID', EmergencyContactController.findEmergencyContactByEmployeeId)
router.patch('/update', EmergencyContactController.updateEmergencyContactById)
router.delete('/delete', EmergencyContactController.deleteEmergencyContactById)

router.get("/CSVHeader", EmergencyContactController.generateCSVHeader);
router.post("/saveAll", EmergencyContactController.createAllEmergencyContact);
module.exports = router
