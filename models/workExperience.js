const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const workExperienceSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    title: { type: String, required: true },
    employmentType: { type: String, required: true },
    companyName: { type: String, required: true },
    phoneNo: {type: String },
    startDateMonth: { type: Number, required: true },
    startDateYear: { type: Number, required: true },
    endDateMonth: { type: Number, required: true },
    endDateYear: { type: Number, required: true },
    totalExperience: { type: Number, required: true },
    reportingManagerName: { type: String },
    reportingManagerEmail: { type: String },
    designation: { type: String },
    reasonForLeaving: { type: String },
    city: { type: String },
    country: { type: String, required: true },
    state: { type: String, required: true },
    filePath:{ type: String },
    fileName:{ type: String },
    file: {type : Object },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'workExperience', minimize: false, timestamps: true },
)

workExperienceSchema.plugin(uniqueValidator)

module.exports = workExperienceSchema