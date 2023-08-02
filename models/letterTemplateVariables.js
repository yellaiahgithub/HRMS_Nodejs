const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const letterTemplateVariablesSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, required: true },
    mappingName: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: Boolean, default: true },
    templateType: { type: String, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "letterTemplateVariables", minimize: false, timestamps: true }
);

letterTemplateVariablesSchema.plugin(uniqueValidator);

module.exports = letterTemplateVariablesSchema;
