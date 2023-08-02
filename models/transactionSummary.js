const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const transactionSummarySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    requestUUID: { type: String, required: true },
    employeeUUID: { type: String, required: true },
    requestType: { type: String, required:true },
    requestedDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    status: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    collection: "transactionSummary",
    minimize: false,
    timestamps: true,
  }
);

transactionSummarySchema.plugin(uniqueValidator);

module.exports = transactionSummarySchema;
