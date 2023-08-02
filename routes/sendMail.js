const express = require('express')
const router = express.Router()
const sendMailController = require('../controllers/SendMail')

// Place your user routes here
router.post('/', sendMailController.sendMailFunction)
//This API takes the mailNotification Type and email as input and gets the email Subject, email Body from mailNotifications Collection that matches mailNotification Type  and send the email with modified email Body (by replacing the variables with actual values), email Subject
router.post('/sendMailByType', sendMailController.fetchByType)
router.post('/sample', sendMailController.sendSampleTemplate)

router.post('/createMailTemplate', sendMailController.createMailNotificationTemplate)
router.get('/getallMailTemplate', sendMailController.fetchAllTemplate)
router.get('/getallMailTemplatesLite', sendMailController.fetchAllTemplateLite)
router.get('/fetchByUUID', sendMailController.fetchByUUID)
router.patch('/update', sendMailController.updateTemplate)

router.post('/generateMail/:type', sendMailController.generateMail)
router.get('/getMailNotificationConstants', sendMailController.getMailNotificationConstants)

module.exports = router
