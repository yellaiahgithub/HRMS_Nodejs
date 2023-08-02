const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const uploadResultsSchema = new Schema(
  {
    type: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    fileName: { type: String, required: true },
    errorFileName: { type: String, required: false },
    status: { type: String, required: true },
    uploadedData: { type: Array, required: true },
    errorData: { type: Array, required: false },
    csvHeader:{ type: Array, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "uploadResults", minimize: false, timestamps: true }
);

uploadResultsSchema.plugin(uniqueValidator);

module.exports = uploadResultsSchema;
