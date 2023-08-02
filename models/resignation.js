const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const resignationSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    reasonCode: { type: String, required: true },
    details: { type: String, required: true },
    noticePeriodAsPerPolicy: {
      type: Object,
      item: {
        value: { type: String, required: true },
        unit: {
          type: String,
          required: true,
          enum: ["Days", "Weeks", "Months"],
        },
      },
    },
    lastWorkingDateAsPerPolicy: { type: Date, required: true },
    isEarlyExit: { type: Boolean, default: false },
    lastWorkingDateAsPerEmployee: { type: Date },
    reasonForEarlyExit: { type: String },
    submittedBy: {
      type: String,
      required: true,
      enum: ["Employee", "Manager"],
    },
    createdBy: { type: String, required: true },
    lastWorkingDate: { type: Date, required: true },
    status: { type: String, enum: ["Approved", "Rejected"] },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isActive : { type:Boolean, default:true}
  },
  { collection: "resignation", minimize: false, timestamps: true }
);

resignationSchema.plugin(uniqueValidator);

module.exports = resignationSchema;
