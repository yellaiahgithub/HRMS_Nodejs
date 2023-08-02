const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const probationControlSetupSchema = new Schema({
    uuid: { type: String, default: uuid.v4, required: true },
    autoConfirmProbation : {type: Boolean, default: false,  required: true},
    autoConfirmProbationAfter : {type: Number, default: 0},
    remindAdmin : {type: Boolean, default: false,  required: true},
    remindAdminPrior : {type: Number, default: 0},
    remainderNotificationTemplate : {type: String},
    sendRemainderNotifications : {type: Boolean, default: false,  required: true},
    remainderNotificationsTo: { type: Array },
    sendConfirmationNotifications : {type: Boolean, default: false,  required: true},
    confirmationNotificationsTo : { type:Array },
    confirmationNotificationTemplate : {type: String},
    postDateRemainders : {type: Boolean,required: true, default: false},
    postDateRemaindersAfterEvery : {type: Number, default: 0},
    postDateRemaindersTo : {type: Array},
    postDateRemainderNotificationTemplate: {type: String},
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
},
    { collection: 'probationControlSetup', minimize: false, timestamps: true },
)

probationControlSetupSchema.plugin(uniqueValidator)

module.exports = probationControlSetupSchema