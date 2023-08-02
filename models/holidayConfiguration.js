const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const  HolidayCalendarConfigurationSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
    locationId : [{ type: String, required: true }],
    holidays : {
      type: Array,
      items: [
        {
          type: { type: String, required: true },
          nameOfHoliday : { type: String, required: true },
          startDate: { type: Date, required: true },
          endDate  : { type: Date, required: true },
          isSelected  : { type: Boolean, required: true },
        }
      ]
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "holidayConfiguration", minimize: false, timestamps: true }
);
HolidayCalendarConfigurationSchema.index({locationId:1, year:1,  isActive: 1 },  { unique: true })
HolidayCalendarConfigurationSchema.index({year:1, name:1, "holidays.nameOfHoliday": 1, "holidays.startDate": 1, "holidays.endDate": 1, isActive: 1 },  { unique: true })
HolidayCalendarConfigurationSchema.index({year:1, name:1, locationId: 1, isActive: 1 },  { unique: true })

HolidayCalendarConfigurationSchema.plugin(uniqueValidator);

module.exports = HolidayCalendarConfigurationSchema;
