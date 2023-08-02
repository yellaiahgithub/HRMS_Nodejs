const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;
const uuid = require('uuid')

const employeeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    uuid: { type: String, default: uuid.v4, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String, required: false },
    password: { type: String},
    jobType: { type: String, required: false },
    jobStatus: { type: String, required: false },
    fatherOrHusband: { type: String, required: false },
    fatherOrHusbandName: { type: String, required: false },
    dob: { type: Date, required: false },
    age: { type: Number, required: false },
    celebratesOn: { type: Date, required: false },
    birthCountry: { type: String, required: false },
    birthState: { type: String, required: false },
    birthPlace: { type: String, required: false },
    bloodGroup: { type: String, required: false },
    nationality: { type: String, required: false },
    gender: { type: String, required: false },
    maritalStatus: { type: String, required: false },
    hireDate: { type: Date, required: false },
    confirmationDate: { type: Date, required: false },
    reasonForHire: { type: String, required: false },
    department: { type: String, required: false },
    location: { type: String, required: false },
    designation: { type: String, required: false },
    managerUUID: { type: String, required: false },
    userId:{ type: String, required: false },
    roleUUIDs:[{ type: String }],
    file:{ type: Object },
    isActive: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    previousPasswords : { type: Array },
    passwordReset: { type: Boolean, default: false },
    incorrectPasswordAttempts: { type: Number, default: 0 },
    probationDate : { type: Date}
  },
  { collection: "employee", minimize: false, timestamps: true }
);

employeeSchema.plugin(uniqueValidator)

module.exports =  employeeSchema
