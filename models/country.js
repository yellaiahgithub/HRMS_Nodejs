const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const countrySchema = new Schema(
  {
    uuid: { type: String, uique: true, default: uuid.v4, required: true },
    name: { type: String, required: true, unique: true },
    states: { type: Array, required: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    _id: false,
  },
  { collection: "country", minimize: false, timestamps: true }
);

countrySchema.plugin(uniqueValidator);

module.exports = countrySchema;
