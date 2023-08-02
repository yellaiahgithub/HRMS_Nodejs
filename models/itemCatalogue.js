const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const itemCatalogueSchema = new Schema(
  {
    type: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    status: { type: Boolean, required: true },
    effectiveDate: { type: Date, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "itemCatalogue", minimize: false, timestamps: true }
);

itemCatalogueSchema.plugin(uniqueValidator);

module.exports = itemCatalogueSchema;
