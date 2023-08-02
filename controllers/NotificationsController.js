const apiResponse = require('../helper/apiResponse')
const NotificationsService = require('../services/NotificationsService')
const logger = require('../common/logging/services/logger').loggers.get('general')

class NotificationsController {
  constructor() {
  }
 
  addNotification = async (req, res, next) => {
    try {
      logger.info('NotificationsController -Add notification , Data: ' + JSON.stringify(req.body))
      // if (!req.body.userUUID) throw new Error('User UUID is required.')
      if (!req.body.notificationType) throw new Error('Message type is required.')
      if (!req.body.message) throw new Error('Message is required.')
      let query = {};
      query["employeeList"] = req.body?.employeeList;
      query["notificationType"] = req.body?.notificationType;
      query["notificationFor"] = req.body?.notificationFor;
      query["toNotify"] = req.body?.toNotify;
      query["message"] = req.body?.message;
      // call method to service
      let result = await NotificationsService.addNotification(query, req);
      
      if (!result) {
        return apiResponse.notFoundResponse(res, `Notification could not be added.`)
      }
      
      return apiResponse.successResponseWithData(res, ' Notification added Successfully', result)
    } catch (error) {
      logger.error(error)
      apiResponse.errorResponse(res, error.message)
    }
  }

  getNotificationsByUUID = async (req, res, next) => {
    try {
      logger.info('NotificationsController - Get Notifications, Data: ' + JSON.stringify(req.params))
      if (!req.query.employeeUUID) throw new Error('employeeUUID is required.')
      
      // create query to find data by uuid and name  
      let query = {}
      let pipelineOnConditions = []
      let projection = {}
      query.employeeUUID = req.query.employeeUUID
      if(req.query.notificationType) {
        query.notificationType = new RegExp(req.query.notificationType,"i")

        if(req.query.notificationType?.toLowerCase() == 'announcement') {
          pipelineOnConditions.push(
            {
              $lookup: {
                from: "announcement",
                localField: "notificationFor",
                foreignField: "uuid",
                as: "announcement"
              }
            },
            {
              $unwind: {
                path: '$announcement',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $lookup: {
                  from: 'employee',
                  let : { "id": "$announcement.createdBy" },
                  "pipeline": [
                      { "$match": { "$expr": { "$eq": ["$uuid", "$$id"] }}},
                      { "$project": {  
                          _id:0,
                          employeeName: {
                          $concat: ["$firstName", " ", "$lastName"],
                        },}}
                    ],
                  as: 'employee',
              }
            },
            {
                $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays : false
                },
            }
          );

          projection.announcement = "$announcement"
          projection.postedBy = "$employee.employeeName"
        }

      }
      if(req.query.toNotify != undefined) {
        query.toNotify = JSON.parse(req.query.toNotify)
      }
      
       let pipeline = [
        {
          $match: {
            ...query
          }
        },
        ...pipelineOnConditions,
        {
          $project: {
            _id:0,
            employeeUUID :1,
            message:1,
            notificationType: 1,
            createdAt: 1,
            isRead: 1,
            uuid:1,
            isActive:1,
            ...projection
            
          }
        }
      ]
      // call method to service
      const result = await NotificationsService.getNotificationsByUUID(pipeline, req)
      
      // return if record not found
      if (!result) {
        return apiResponse.notFoundResponse(res, `No Notifications found`);
      }
      
      return apiResponse.successResponseWithData(res, 'Get Notifications Successfully', result)
      
    } catch (error) {
      logger.error(error)
      apiResponse.errorResponse(res, error.message)
    }
  }

  getNotificationCountByUUID = async (req, res, next) => {
    try {
      logger.info('NotificationsController - Get Notifications Count, Data: ' + JSON.stringify(req.query))
       if (!req.query.employeeUUID) throw new Error('employeeUUID is required.')
      
      const result = await NotificationsService.getNotificationCountByUUID(req.query.employeeUUID, req);
  
      // return if record not found
      if (!result) {
        return apiResponse.notFoundResponse(res, `No Notifications found`);
      }
        return apiResponse.successResponseWithData(res, 'Get Notification Count Successfully', result)
      
    } catch (error) {
      logger.error(error)
      apiResponse.errorResponse(res, error.message)
    }
  }
}

module.exports = new NotificationsController()