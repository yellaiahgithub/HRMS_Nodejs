const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const jobBandSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    bandId: { type: String, required: true, unique: true },
    bandName: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    status: { type: Boolean, default: true },
    description: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "jobBand", minimize: false, timestamps: true }
);

jobBandSchema.plugin(uniqueValidator);

module.exports = jobBandSchema;
