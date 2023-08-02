const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const employeeInfoHistorySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    documentUUID: { type: String, required: false },
    orderNo: { type: Number, required: true },
    type: { type: String, required: true, enum: ["EmployeeName", "EmployeeGender", "EmployeeEmail", "EmployeePhone", "EmployeeAddress", "EmployeeEmergencyContact", "EmployeeJobDetails"] },
    name: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },
    historyObject: { type: Object },
    effectiveDate: { type: Date, required: true },
    reason: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: String },
    updatedBy: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "employeeInfoHistory", minimize: false, timestamps: true }
);

employeeInfoHistorySchema.plugin(uniqueValidator);

module.exports = employeeInfoHistorySchema;
