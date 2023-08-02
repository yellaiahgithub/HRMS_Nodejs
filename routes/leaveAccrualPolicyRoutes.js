const express = require('express')

const router = express.Router()
const LeaveAccrualPolicyController = require('../controllers/leaveAccrualPolicyController')

// Place your user routes here
router.post('/save', LeaveAccrualPolicyController.createLeaveAccrualPolicy)
router.put('/update', LeaveAccrualPolicyController.updateLeaveAccrualPolicy)
router.get('/fetchAll', LeaveAccrualPolicyController.findAll)
router.get('/fetch', LeaveAccrualPolicyController.findLeaveAccrualPolicy)

module.exports = router
