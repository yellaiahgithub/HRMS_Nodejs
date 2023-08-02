const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const employeeEmailSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    employeeUUID: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    type: { type: String, required: false },
    isPreferred: { type: Boolean, required: true,default:false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "employeeEmail", minimize: false, timestamps: true }
);

employeeEmailSchema.plugin(uniqueValidator);

module.exports = employeeEmailSchema;
