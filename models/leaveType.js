const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const leaveTypeSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    id: { type: String, required: true, unique:true },
    name: { type: String, required: true, unique:true },
    effectiveDate: { type:Date , required: true },
    isActive : { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "leaveType", minimize: false, timestamps: true }
);

leaveTypeSchema.plugin(uniqueValidator);

module.exports = leaveTypeSchema;
