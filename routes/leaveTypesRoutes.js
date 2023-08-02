const express = require('express')

const router = express.Router()
const leaveTypeController = require('../controllers/leaveTypeController.js')

// Place your user routes here
router.post('/', leaveTypeController.createLeaveType)
router.patch('/:uuid', leaveTypeController.updateLeaveType)
router.get('/', leaveTypeController.findAll)

module.exports = router
