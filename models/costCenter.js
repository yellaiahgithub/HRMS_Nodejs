const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const costCenterSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    departmentId: { type: String, required: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "costCenter", minimize: false, timestamps: true }
);

costCenterSchema.plugin(uniqueValidator);

module.exports =  costCenterSchema;
