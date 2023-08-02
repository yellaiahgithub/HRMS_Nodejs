const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const educationSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    levelOfEducation: { type: String, required: true },
    modeOfEducation: { type: String },
    nameOfDegree: { type: String },
    isHighestEducation: { type: Boolean },
    aggregate: { type: String },
    fullTimeOrPartTime: { type: String },
    yearOfPassing: { type: String },
    istheCollege: { type: String },
    nameofTheCollegeOrSchoolOrOrganization: { type: String },
    nameOfBoard: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    file:{ type: Object },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'education', minimize: false, timestamps: true },
)

educationSchema.plugin(uniqueValidator)

module.exports = educationSchema