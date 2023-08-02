const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const PasswordRuleSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    companyUUID: { type: String, required: true, unique: true },
    lengthRule: {
      type: Object,
      item: {
        minimum: { type: Number },
        maximum: { type: Number },
        status: { type: Boolean, default: false },
      },
    },
    containsRule: {
      type: Array,
      item: {
        minOrMax: { type: String },
        length: { type: Number },
        status: { type: Boolean, default: false },
        type: {
          type: String,
          enum: ["Special Character", "Upper Case", "Lower Case"],
        },
      },
    },
    repetitiveRule: {
      type: Object,
      item: {
        count: { type: Number },
        status: { type: Boolean, default: false },
      },
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "passwordRule", minimize: false, timestamps: true }
);

PasswordRuleSchema.plugin(uniqueValidator);

module.exports = PasswordRuleSchema;
