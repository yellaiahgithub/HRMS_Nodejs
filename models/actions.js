const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const actionSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    actionId: { type: String, required: true, unique: true },
    actionCode: { type: String, required: true, unique: true },
    actionName: { type: String, required: true },
    description: { type: String },
    effectiveDate: { type: Date, required: true},
    employeeStatus : { type: Array, required: true },
    jobType: { type: Array, required : true },
    isActive: { type: Boolean , default: true, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'action', minimize: false, timestamps: true },
)

actionSchema.plugin(uniqueValidator)

module.exports =  actionSchema