const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const leaveTypeSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    id: { type: String, required: true, unique:true },
    leaveTypeUUID: { type: String, required: true},
    description: { type: String, required: true},
    eligibleCriteria : {
      type: Object,
      required: true,
      item: {
        value: { type: Number, required: true},
        unit: { type: String, required: true, enum: ["Days", "Weeks", "Months"]},
      }  
    },
    genderApplicability : { type: String, required: true, enum : ["Male", "Female", "Transgender", "All"]},
    maritalStatusApplicability : { type: String, required: true, enum : ["Married", "Divorced", "Single", "Widowed", "All"]},
    isOccasionBased : { type: Boolean, required: true, default: false},
    occasionBased : {
      type: Object,
      required: true,
      item:{
        availedOn: {type: Array },
        autoLeave: {type: Boolean, default: false},
        ifHolidayLeaveGets: {type: String},
      }

    },
    allowHalfDayLeave: { type: Boolean, default:false },
    allowPastDays: { type: Boolean, default:false },
    allowFutureDays: { type: Boolean, default:false },
    allowCurrentDays: { type: Boolean, default:false },
    allowNextYear: { type: Boolean, default:false },
    holidayCountedAsLeave: { type: Boolean, default:false },
    weekOffCountedAsLeave: { type: Boolean, default:false },
    ifBalanceIsZero: {
      type: Object,
      item:{
        isAllowed: { type: Boolean, default: false},
        maxDays: { type:Number },
      } 
    },
    toBeMerged: { type: Boolean, default: false},
    eligibilityToMerge: {
      type: Object,
      item:{
        frequency: { type: String, enum:["No Limit", "1 Time", "2 Times", "3 Times", "4 Times"]},
        criteria: { type:String },
      } 
    },
    utilisedInBreaks: {type: Boolean, default: false},
    medicalCertificateRequired: {type: Boolean, default: false},
    allowMaxConsecutiveDays: {type: Boolean, default: false},
    maxConsecutiveDays: {type: Number},
    allowMaxRetroDays: {type: Boolean, default: false },
    maxRetroDays: {type: Number },
    allowMinDaysBeforeLeaveDate: {type: Boolean, default: false },
    minDaysBeforeLeaveDate: {type: Number},
    allowEncashment: {type: Boolean, default: false },
    allowCarryForward: {type: Boolean, default: false },
    prorateGrantedLeaves : {type: Boolean, default: false },
    leaveEntitlement : { type: String},
    grantRules: {
      type: Array,
      required: true,
      items: [
        {
          fromService: { type: Number, required: true},
          toService: { type: Number, required: true},
          entitlement: { type: Number, required: true},
          recurrence: { type: String, required: true, enum:["Monthly", "Quarterly", "Half Yearly", "Annually"]},
          initiation:  { type: String, required: true, enum:["Beginning", "Ending"]},
        }
      ]
    },
    isActive : { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "leavePolicy", minimize: false, timestamps: true }
);

leaveTypeSchema.plugin(uniqueValidator);

module.exports = leaveTypeSchema;
