const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const adminSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'admin', minimize: false, timestamps: true },
)

adminSchema.plugin(uniqueValidator)

module.exports = adminSchema