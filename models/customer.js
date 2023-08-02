const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const customerSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    customerName: { type: String, required: true},
    registrationDate: { type: Date, required: true},
    superAdminName: { type: String},
    email: {
        type: String,
        index: true,
        match: /.+\@.+\..+/,
    },
    phoneNo: {type: String, match:/^\+?[1-9][0-9]{7,14}$/ },
    password: { type: String, required: true, default : "customer123" },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'customer', minimize: false, timestamps: true },
)

customerSchema.plugin(uniqueValidator)

module.exports =  customerSchema