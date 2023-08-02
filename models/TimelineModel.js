const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const TimelineSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    incident: { type: String, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "timeline", minimize: false, timestamps: true }
);

module.exports = TimelineSchema;
