const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const employeeDependantOrBeneficiarySchema = new Schema(
  {
    employeeUUID: { type: String, required: true },
    relationWithEmployee: { type: String, required: false, default: "N/A" },
    type: { type: String, required: true },
    beneficiaryType: { type: String, required: false },
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: false },
    gender: { type: String, required: false, default: "N/A" },
    dob: { type: Date, default: null },
    maritalStatus: { type: String, required: false, default: "N/A" },
    age: { type: Number, required: false },
    addressLineOne: { type: String, required: false },
    addressLineTwo: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    pinCode: { type: String, required: false },
    isStudent: { type: Boolean, required: false, default: null },
    disabled: { type: Boolean, required: false, default: null },
    disabilityType: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    collection: "employeeDependantOrBeneficiary",
    minimize: false,
    timestamps: true,
  }
);

employeeDependantOrBeneficiarySchema.plugin(uniqueValidator);

module.exports = employeeDependantOrBeneficiarySchema;
