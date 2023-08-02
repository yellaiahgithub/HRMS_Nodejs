const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const letterTemplateSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, required: true },
    body: { type:String, required: true },
    status: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "letterTemplate", minimize: false, timestamps: true }
);

letterTemplateSchema.plugin(uniqueValidator);

module.exports = letterTemplateSchema;
