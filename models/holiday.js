const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const  HolidayCalendarSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, required: true, unique: true,
      index: true,
      trim: true,
      uniqueCaseInsensitive: true 
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "holiday", minimize: false, timestamps: true }
);

HolidayCalendarSchema.plugin(uniqueValidator);

module.exports = HolidayCalendarSchema;
