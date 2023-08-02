const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose
const uuid = require('uuid')

const companySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true, unique: true,},
    companyId: { type: String, required: true, unique: true},
    companyName: { type: String, required: true, unique: true},
    subdomainName : { type: String, required: true, unique: true},
    registrationDate: { type: Date },
    corporateIdentityNumber: { type: String },
    ROCRegisteredNumber: { type: String },
    ROCCode : { type : String },
    registeredDate : { type: Date},
    registeredUnder : { type : String},
    sector : { type : String},
    industry : { type : String},
    companyPAN : { type : String},
    PANRegisteredDate : { type : Date},
    PFAccountNumber : { type : String},
    PFRegisteredDate : { type : Date},
    ESIAccountNumber : {type : String},
    ESIRegisteredDate : { type : Date},
    defaultCurrency : {type : String},
    officialLanguage : {type : String},
    shiftPattern : {type : String},
    retirementAge : {type : String, required: true},
    holidayCalendar : {type : String},
    customerUUID : {type : String},
    file: {type : Object },
    companyPhoneNumbers: {
      type: Array,
      items: [
        {
          phoneType : {type : String, required: true},
          phoneNumber : {type : String, required: true},
          extension : {type : String },
          preferred : {type : Boolean, required: true},
        }
      ]
    },
    companyPhysicalAddress: {
      type: Array,
      items: [
        {
          addressType : {type : String, required: true},
          address : {type : String, required: true},
          asOfDate : {type : Date , required: true},
          status : {type : String, required: true},
          preferred : {type : Boolean, required: true},
        }
      ]
    },
    companyEmailAddress: {
      type: Array,
      items: [
        {
          emailType : {type : String, required: true},
          email: {
              type: String,
              index: true,
              match: /.+\@.+\..+/,
              required: true
          },
          preferred : {type : Boolean, required: true},
        }
      ]
    },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'company', minimize: false, timestamps: true },
)
companySchema.plugin(uniqueValidator);
module.exports =  companySchema