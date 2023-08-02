const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const roleSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, required: true, unique: true},
    description : { type: String, required: true},
    permissions: { type: Array },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'roles', minimize: false, timestamps: true },
)

roleSchema.plugin(uniqueValidator)

module.exports =  roleSchema