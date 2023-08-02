const mongoose = require('mongoose')
const uuid = require('uuid')

const notificationSchema = new mongoose.Schema(
  {
    uuid: { type: String, unique: true, default: uuid.v4(), required: true },
    employeeUUID: { type: String, required: true },
    notificationType: { type: String, required: true },
    notificationFor : { type: String, required: true },
    message: { type: String },
    toNotify: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isRead: { type: Boolean, default: false }
  },
  { collection: "notification", minimize: false, timestamps: true }
)

module.exports = notificationSchema
