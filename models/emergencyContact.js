const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose
const uuid = require('uuid')

const emergencyContactSchema = new Schema(
  {
    // id: { type: String, required: true, unique: true },
    uuid: { type: String, default: uuid.v4, required: true, unique: true,},
    employeeUUID: { type: String, required: true },
    contactName: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNo: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    addressLine1: { type: String },
    addressLine2: { type: String },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    addressSameAsEmployee: { type: Boolean },
    pinCode: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "emergencyContact", minimize: false, timestamps: true }
);

emergencyContactSchema.plugin(uniqueValidator);

module.exports =  emergencyContactSchema;
