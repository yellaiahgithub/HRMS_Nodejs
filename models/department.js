// import { transient } from 'mongoose-transient';

// const mongotransient=require("transient");
const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const departmentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    status: { type: Boolean, required: false },
    asOfDate: { type: Date, required: false },
    belongsToCostCenter: { type: Boolean, required: false },
    costCenters: [
      {
        id: { type: String },
        name: { type: String },
        _id: false,
      },
      // {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "costCenter",
      // },
    ],
    hodId: { type: String, required: false },
    hodType: { type: String, required: false },
    locations: { type: Array },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "department", minimize: false, timestamps: true }
);
// departmentSchema.plugin(mongotransient);
departmentSchema.plugin(uniqueValidator);

module.exports = departmentSchema;
