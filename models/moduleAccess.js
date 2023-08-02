const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const moduleAccessSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, enum: ["Core HR", "Leave Management", "India Payroll"], required: true },
    companyId: { type: String, required: true},
    hasClientSubscribed: { type: Boolean, required: true},
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'moduleAccess', minimize: false, timestamps: true },
)

moduleAccessSchema.index({ name: 1, companyId: 1 },  { unique: true })
moduleAccessSchema.plugin(uniqueValidator)

module.exports =  moduleAccessSchema