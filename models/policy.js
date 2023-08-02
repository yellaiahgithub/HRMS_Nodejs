const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const policySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    type: { type: String, required: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'policy', minimize: false, timestamps: true },
)

policySchema.plugin(uniqueValidator)

module.exports =  policySchema