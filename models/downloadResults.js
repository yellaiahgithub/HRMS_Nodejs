const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const downloadResultsSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    type: { type: String, required: true },
    downloadedBy: { type: String, required: true },
    fileName: { type: String, required: true },
    status: { type: String, required: true },
    downloadedData: { type: Array, required: true },
    reportHeader:{ type: Array, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "downloadResults", minimize: false, timestamps: true }
);

downloadResultsSchema.plugin(uniqueValidator);

module.exports = downloadResultsSchema;
