const mongoose = require("mongoose");
const uuid = require("uuid");
const { Schema } = mongoose;

const  HolidayCalendarRestrictionsSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    isRestricted: { type: Boolean, default: true, required: true },
    maxNoOfHolidays: { type: Number, required: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "holidayCalendarRestrictions", minimize: false, timestamps: true }
);

module.exports = HolidayCalendarRestrictionsSchema;
