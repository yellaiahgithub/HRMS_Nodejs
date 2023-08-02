const express = require('express')

const router = express.Router()
const LeaveAccumulationPolicyController = require('../controllers/leaveAccumulationPolicyController')

// Place your user routes here
router.post('/save', LeaveAccumulationPolicyController.createLeaveAccumulationPolicy)
router.put('/update', LeaveAccumulationPolicyController.updateLeaveAccumulationPolicy)
router.get('/fetchAll', LeaveAccumulationPolicyController.findAll)
router.get('/fetch', LeaveAccumulationPolicyController.findLeaveAccumulationPolicy)

module.exports = router
