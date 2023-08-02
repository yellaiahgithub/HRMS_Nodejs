const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const designationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true  },
    description: { type: String, required: false },
    status: { type: Boolean, required: false },
    asOfDate: { type: Date, required: true},
    jobGrade: { type: String, required: false },
    jobLevel: { type: String, required: false },
    isCritical: { type: Boolean, default: false },
    isOneToOne: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "designation", minimize: false, timestamps: true }
);

designationSchema.plugin(uniqueValidator);

module.exports =  designationSchema;
