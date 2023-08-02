const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const announcementSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    startDate: { type: Date, required: true},
    endDate: { type: Date, required: true},
    title : { type: String, required: true},
    news : { type: String, required: true},
    publishTo : { type: String, required: true, default: 'All Employees'},
    publishToIDs : [{ type: String}],
    notify : { type: Boolean , required: true},
    status : { type: Boolean, default: true},
    createdBy : { type: String, required: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'announcement', minimize: false, timestamps: true },
)

announcementSchema.plugin(uniqueValidator)

module.exports =  announcementSchema