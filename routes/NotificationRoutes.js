const express = require('express')
const router = express.Router()
const NotificationsController = require('../controllers/NotificationsController')

// Place your user routes here
router.post('/', NotificationsController.addNotification)
router.get('/count', NotificationsController.getNotificationCountByUUID)
router.get('/', NotificationsController.getNotificationsByUUID)


module.exports = router
