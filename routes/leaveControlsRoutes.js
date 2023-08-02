const express = require('express')

const router = express.Router()
const LeaveControlsController = require('../controllers/leaveControlsController')

// Place your user routes here
router.post('/save', LeaveControlsController.createLeaveControls)
router.put('/update', LeaveControlsController.updateLeaveControls)
router.get('/fetch', LeaveControlsController.findLeaveControls)

module.exports = router
