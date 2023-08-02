const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const bankSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    bankId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean , default: true, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'bank', minimize: false, timestamps: true },
)

bankSchema.plugin(uniqueValidator)

module.exports =  bankSchema