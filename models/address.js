const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const addressSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    addressType: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    status: { type: Boolean, required: true, default: true },
    address1: { type: String, required: true },
    address2: { type: String, required: true },
    address3: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    PIN: { type: Number, required: true },
    isPrimary: { type: Boolean, default: true },
    isActive: { type: Boolean , default: true, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'address', minimize: false, timestamps: true },
)
addressSchema.index({ addressType: 1, employeeUUID: 1, isActive: 1 },  { unique: true })
addressSchema.plugin(uniqueValidator)

module.exports =  addressSchema