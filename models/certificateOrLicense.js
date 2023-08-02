const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const certificateOrlicenseSchema = new Schema(
  {

    
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    type: { type: String },
    nameOfTheCertificateOrLicense: { type: String },
    status: { type: Boolean , default: true},
    effectiveDate: { type: Date },
    levelOfCertification: { type: String },
    dateOfIssue: { type: Date },
    validity: { type: String },
    validityFrom: { type: Date },
    validityUntil: { type: Date },
    hasAnnotation: { type: Boolean },

    annotationFilePath: {type:String},
    annotationFileName: {type:String},
    
    certificateFilePath: {type:String},
    certificateFileName: {type:String},

    certificateFile: {type : Object },
    
    issuingAuthority:{ type: String, required: true },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'certificateOrlicense', minimize: false, timestamps: true },
)

certificateOrlicenseSchema.plugin(uniqueValidator)

module.exports = certificateOrlicenseSchema