const NotificationsService = require('../services/NotificationsService');
const AnnouncementService = require('../services/announcementService');
const { v4: uuidv4 } = require('uuid');
const employeeService = require('../services/employeeService');
const { generateMail } = require('../utils/mailNotificationUtils');
const { MAIL_NOTIFICATION_TYPE } = require('../constants/commonConstants');

class Announcement {
    constructor() { }

    createAnnouncement = async (req, res, next) => {
        try {

            console.log('Create Announcement, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for Announcement
            data.createdBy = res.locals.session?.userUUID; // Posted by employee uuid
            // call method to service
            let resp = await AnnouncementService.create(data, req, res);
            resp = resp[0];
            // Add Notification
            let notificationObj = {
                notificationType : "Announcement",
                notificationFor  : resp?.uuid,
                toNotify : resp?.notify
            }
            if(resp) {
                let allEmployeedUUIDs = []
                let pipeline = []
                if(resp?.publishTo == "All Employees"){
                    pipeline = [{$project : {uuid:1, _id:0}}]
                    allEmployeedUUIDs = await employeeService.findEmployeesAgg(pipeline, req)
                }
                if(resp?.publishTo == "Designation" && data.publishToIDs?.length > 0) {
                    pipeline = [
                        {
                            $match : {
                                designation  : {$in : data.publishToIDs}
                            }
                        },
                        {$project : {uuid:1, _id:0}}
                    ]
                    allEmployeedUUIDs = await employeeService.findEmployeesAgg(pipeline, req)
                }
                if(resp?.publishTo == "Department" && data.publishToIDs?.length > 0) {
                    pipeline = [
                        {
                            $match : {
                                department  : {$in : data.publishToIDs}
                            }
                        },
                        {$project : {uuid:1, _id:0}}
                    ]
                    allEmployeedUUIDs = await employeeService.findEmployeesAgg(pipeline, req)
                }
                if(resp?.publishTo == "Location" && data.publishToIDs?.length > 0) {
                    pipeline = [
                        {
                            $match : {
                                location  : {$in : data.publishToIDs}
                            }
                        },
                        {$project : {uuid:1, _id:0}}
                    ]
                    allEmployeedUUIDs = await employeeService.findEmployeesAgg(pipeline, req)
                }
                
                if(allEmployeedUUIDs?.length>0){
                    notificationObj["employeeList"] = allEmployeedUUIDs?.map(u =>u.uuid)
                    await NotificationsService.addNotification(notificationObj, req)

                    //send mail
                    const inputObj= {}
                    const body={benefactorUUIDs:notificationObj["employeeList"],initiatorUUID:res.locals.session?.userUUID}        
                    generateMail(MAIL_NOTIFICATION_TYPE.PUBLISH_COMPANY_NEWS,body,req,inputObj)
                }
            }
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find Announcement, Data By: ' + JSON.stringify(req.params))
            var todayDate = new Date();

            let result = await AnnouncementService.findAll(todayDate, req);
            if (!result) {
                return res.status(404).send('Announcements not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new Announcement()