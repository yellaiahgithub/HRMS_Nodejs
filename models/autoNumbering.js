const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const autoNumberingSchema = new Schema(
  {
    type: { type: String, required: true, unique: true },
    autoGenerated: { type: Boolean, default: false },
    isAlphaNumeric: { type: Boolean, default: false },
    isSuffix: { type: Boolean, default: false },
    sequenceCode: { type: String },
    sequenceNumber: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    autoNumberingItems: [
      {
        isAlphaNumeric: { type: Boolean, default: false },
        isSuffix: { type: Boolean, default: false },
        autoNumberingCode: { type: String },
        autoNumberingNumber: { type: Number },
        jobType: { type: String },
        _id: false,
      },
    ],
  },
  { collection: "autoNumbering", minimize: false, timestamps: true }
);

autoNumberingSchema.plugin(uniqueValidator);

module.exports =  autoNumberingSchema;
