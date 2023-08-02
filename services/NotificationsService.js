const {v4: uuidv4} = require('uuid');
const logger = require('../common/logging/services/logger').loggers.get('general')
const {
  switchDB,
  getDBModel,
  employeeSchema,
  notificationSchema,
  mailNotificationSchema
} = require("../middlewares/switchDB");
class NotificationsService {
  
  addNotification = async (query, req) => {
    try {
      logger.info('Create a System Notification, Data By: ' + query)
      const { notificationFor,toNotify, notificationType, message} = query
      const companyName = req.subdomain;
      const notificationDB = await switchDB(companyName, notificationSchema);
      const notificationModel = await getDBModel(notificationDB, "notification");

      const notificationsToAdd = query["employeeList"].map((employee) => {
        return {
          uuid: uuidv4(),
          employeeUUID: employee,
          notificationType,
          notificationFor,
          toNotify,
          message,
          isRead: false
        }
      })

      const result = await notificationModel.insertMany(notificationsToAdd)
      return { recordsAdded: result?.length ?? 0 }
    } catch (error) {
      console.error('******', error)
      logger.error(error)
      throw new Error(error)
    }
  }

  getNotificationsByUUID = async (pipeline, req) => {
    try {
      const notificationDB = await switchDB(req?.subdomain, notificationSchema);
      const notificationModel = await getDBModel(notificationDB, "notification");

      const fetchedNotifications = await notificationModel.aggregate(pipeline)
      const sortedDates = fetchedNotifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return sortedDates
    } catch (error) {
      logger.error(error)
      throw new Error(error)
    }
  }

  updateReadFlag = async (notifications, req) => {
    try {
      const notificationDB = await switchDB(req?.subdomain, notificationSchema);
      const notificationModel = await getDBModel(notificationDB, "notification");

      const updatedNotifications = await Promise.all(
        notifications.map(async (notification) => {
          let updatedNotification = null
          const dataToUpdate = { isRead: true }
          try {
            if (notification.isRead === false) {
              updatedNotification = await notificationModel.findOneAndUpdate(
                { uuid: notification.uuid },
                { $set: dataToUpdate }
              )
            }
            delete notification.isRead;
            delete notification.uuid;
            return updatedNotification
          } catch (error) {
            logger.error(error)
            console.log(error)
            return {}
          }
        })
      )
      return updatedNotifications
    } catch (error) {
      logger.error(error)
      throw new Error(error)
    }
  }

  getNotificationCountByUUID = async (uuid, req) => {
    try {
      const notificationDB = await switchDB(req?.subdomain, notificationSchema);
      const notificationModel = await getDBModel(notificationDB, "notification");

      const fetchedNotifications = await notificationModel.countDocuments({
        employeeUUID: uuid,
        isRead: false,
      })
      return { numberOfUnreadMessages: fetchedNotifications ?? 0 }
    } catch (error) {
      logger.error(error)
      throw new Error(error)
    }
  }

  createMailTemplate = async (data, req) => {
    try {
      console.log('Data Create Notification Template', data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, mailNotificationSchema)
      const model = await getDBModel(DB, 'mailNotifications')
      return await model.insertMany([data], { runValidators: true })
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
  }

  fetchAllMailNotificationTemplate = async (req) => {
    try {
      console.log('Fetch all Notification Template');
      const companyName = req.subdomain
      const DB = await switchDB(companyName, mailNotificationSchema)
      const model = await getDBModel(DB, 'mailNotifications')
      return await model.find({isActive: true}).lean()
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
  }

  aggregate = async (pipeline,req) => {
    try {
      console.log('Fetch all Notification Template');
      const companyName = req.subdomain
      const DB = await switchDB(companyName, mailNotificationSchema)
      const model = await getDBModel(DB, 'mailNotifications')
      return await model.aggregate(pipeline)
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
  }

  // FetchByUUID
  fetchByQuery = async (query, req) => {
    try {

        console.log('Fetch all Mail Notification Template, Data By: ' + JSON.stringify(req.body))
        
        const companyName = req.subdomain
        const DB = await switchDB(companyName, mailNotificationSchema)
        const model = await getDBModel(DB, 'mailNotifications')
        return await model.findOne(query).lean()
    } catch (error) {
        console.error(error)
        res.status(400).send(error.message)
    }
  }

  update = async (uuid, data, req, res) => {
    try {
        console.log('Update Template, Data: ' + JSON.stringify(data))
        const companyName = req.subdomain
        const DB = await switchDB(companyName, mailNotificationSchema)
        const model = await getDBModel(DB, 'mailNotifications')
        // find and update record in mongoDB
        return await model.findOneAndUpdate({ uuid: uuid }, { $set: data }, { new: true, context: 'query', runValidators: true })
    } catch (error) {
        console.log(error)
        throw new Error(error);
    }
  }

}

module.exports = new NotificationsService()
