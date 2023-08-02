const { sendMail } = require('../helper/SendMail')
const { settings } = require('../config/default.json');
const  notificationsService  = require('../services/NotificationsService');
const {v4: uuidv4} = require('uuid');
const mailNotificationUtils = require('../utils/mailNotificationUtils');
const { MAIL_NOTIFICATION_TYPE, MAIL_RECEPIENTS } = require('../constants/commonConstants');
class SendMail {
    constructor() { }

    createMailNotificationTemplate = async (req, res, next) => {
        try {

            console.log('Create Mail Notification Template, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for Policy
            // call method to service
            let resp = await notificationsService.createMailTemplate(data, req);
            if (!resp) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    fetchAllTemplate = async (req, res, next) => {
        try {
            console.log('Fetch all Mail Notification Template, Data By: ' + JSON.stringify(req.body))
            let resp = await notificationsService.fetchAllMailNotificationTemplate(req);
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    fetchAllTemplateLite = async (req, res, next) => {
        try {
            const pipeline=[
                {
                    $project:{
                        _id:0,
                        notificationType:1,
                        uuid:1
                    }
                }
            ]
            let resp = await notificationsService.aggregate(pipeline,req);
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    fetchByUUID = async (req, res, next) => {
        try {
            console.log('Fetch By UUID Mail Notification Template, Data By: ' + JSON.stringify(req.body))
            if (!req.query.uuid) { throw new Error("UUID is required") }
            let query = {uuid: req.query.uuid}
            let resp = await notificationsService.fetchByQuery(query, req);
            if (!resp) {
                return res.status(404).send('No Matching Results Found');
            }
            return res.status(200).send(resp);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updateTemplate = async (req, res) => {
        try {
            if (Object.keys(req.body).length === 0) {
                return apiResponse.notFoundResponse(res, `No data found for update`);
            }
            if (!req.body.uuid) return apiResponse.errorResponse(res, "Please send template UUID");

            const data = req.body
            data.updatedAt = new Date()
            let uuid = req.body.uuid
            // call method to service
            let resp = await notificationsService.update(uuid, data, req, res);
            if (resp) {
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No reason found for the reasonCode provided:${reasonCode}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }

    fetchByType = async (req, res, next) => {
        try {
            console.log('Fetch By UUID Mail Notification Template, Data By: ' + JSON.stringify(req.body))
            if (!req.query.type) { throw new Error("Type is required") }
            let query = {notificationType: req.query.type}
            let resp = await notificationsService.fetchByQuery(query, req);
            if (!resp) {
                return res.status(404).send('No Matching Results Found By Type -', req.query.type);
            }
            const to  = req.query.email
            const subject  = resp.subject
            const template  = resp.body
            
            const result =  await sendMail({
                to,
                subject,
                template
            })
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    sendSampleTemplate = async (req, res, next) => {
        try {
            console.log('Sample Mail Notification Template, Data By: ' + JSON.stringify(req.body))
            const to  = [req.body.email]
            const subject  = req.body.subject
            const template  = req.body.body
            const result =  await sendMail({
                to,
                subject,
                template
            })
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    sendMailFunction = async (req, res, next) => {
        // send mail password reset link
        try{
            const {to, subject, template} = req.body
            const result =  await sendMail({
                to,
                subject,
                template
            })
            return res.status(200).send(result);
        } catch(error) {
            return res.status(500).send(error.message);
        }
    }

    generateMail = async (req,res,next)=>{
        try {
            if(!req.params.type)throw new Error("Template Type is required")
            const inputObj = req.body.inputObj ? req.body.inputObj : {}
            const emails = await mailNotificationUtils.generateMail(req.params.type,req.body,req, inputObj)
            return res.status(200).send(emails);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    getMailNotificationConstants = async(req,res,next)=>{
        try{
        const notificationTypes=[],mailRecepients=[]
        for (let key in MAIL_NOTIFICATION_TYPE) {
            notificationTypes.push(MAIL_NOTIFICATION_TYPE[key])
        }
        for (let key in MAIL_RECEPIENTS) {
            mailRecepients.push(MAIL_RECEPIENTS[key])
        }
        const mailNotificationConstants={
            notificationTypes:notificationTypes,
            mailRecepients:mailRecepients
        }
        return res.status(200).send(mailNotificationConstants);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new SendMail()