const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const reasonSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    actionCode: { type: String, required: true },
    reasonId: { type: String, required: true, unique: true },
    reasonCode: { type: String, required: true, unique: true },
    reasonName: { type: String, required: true },
    description: { type: String },
    effectiveDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'reasons', minimize: false, timestamps: true },
)

reasonSchema.plugin(uniqueValidator)

module.exports =  reasonSchema