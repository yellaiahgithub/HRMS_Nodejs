const mongoose = require('mongoose')
const uuid = require('uuid')

const mailNotificationSchema = new mongoose.Schema(
  {
    uuid: { type: String, unique: true, default: uuid.v4(), required: true },
    notificationType: { type: String, required: true, unique: true},
    notificationTo:{ type:Array,
      item : {
        type:{ type:String,required:true,enum: ["TO","CC","BCC"]},
        recepients : { type:Array, item:String,enum:["Initiator", "Initiator’s L1", "Initiator’s L2", "Admin", "Role","Designation","Benefactor","Benefactor’s Department","Benefactor’s Location"]},
        roleUUIDs:{ type:Array, item:String },
        designationIDs : { type:Array, item:String },
      }
    },
    description : { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    acknowledgementBody: { type: String, required: false },
    acknowledgeTo:{ type:Array,
      item : {
        type:{ type:String,required:true,enum: ["TO","CC","BCC"]},
        recepients : { type:Array, item:String,enum:["Initiator", "Initiator’s L1", "Initiator’s L2", "Admin", "Role","Designation","Benefactor","Benefactor’s Department","Benefactor’s Location"]},
        roleUUIDs:{ type:Array, item:String },
        designationIDs : { type:Array, item:String },
      }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: "mailNotifications", minimize: false, timestamps: true }
)

module.exports = mailNotificationSchema
