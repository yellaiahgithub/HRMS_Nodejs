const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const locationSchema = new Schema(
    {
        uuid: { type: String, default: uuid.v4, required: true },
        locationId: { type: String, required: true, unique: true  },
        locationName: { type: String, required: true, unique: true },
        effectiveDate: { type: Date, required: true },
        status: { type: Boolean, required: true, default: true },
        cityClassification: { type: String },
        isPTApplicable: { type: Boolean },
        address: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        state: { type: String, required: true },
        pin: { type: String, required: true },
        isProcessingHub: { type: Boolean },
        processingHub: { type: String },
        ESIApplicable: { type: Boolean },
        ESILocalOffice: { type: String },
        ESIAccountNumber: { type: Number },
        ESIStartDate: { type: Date },
        companyTAN: { type: String },
        TANRegisteredDate: { type: Date },
        PFCircle: { type: String },
        deductorType: { type: String },
        holidayCalendarID: { type: String },
        timePatternID: { type: String },
        departmentIDs: { type: Array },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date },
        updatedAt: { type: Date }
    },
    { collection: 'locations', minimize: false, timestamps: true },
)

locationSchema.plugin(uniqueValidator)

module.exports = locationSchema