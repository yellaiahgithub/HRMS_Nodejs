const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const companyPolicySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    type: { type: String, required: true},
    version : { type: String, required: true, unique: true},
    effectiveDate : { type: Date, required: true},
    status : { type: Boolean, required: true, default: true},
    upload : { type: Object , required: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'companyPolicy', minimize: false, timestamps: true },
)

companyPolicySchema.plugin(uniqueValidator)

module.exports =  companyPolicySchema