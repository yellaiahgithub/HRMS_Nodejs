const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const bankBranchSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    bankUUID: { type: String, required: true },
    name: { type: String, required: true },
    branchId: { type: String, required: true, unique: true },
    ifscCode :  { type: String, required: true, unique: true },
    micrCode :  { type: String },
    asOfDate : { type: Date, required: true},
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: String, required: true },
    isActive: { type: Boolean , default: true, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'bankBranch', minimize: false, timestamps: true },
)
bankBranchSchema.index({ name: 1, bankUUID: 1, isActive: 1 },  { unique: true })
bankBranchSchema.plugin(uniqueValidator)

module.exports =  bankBranchSchema