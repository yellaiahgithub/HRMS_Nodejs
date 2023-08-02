const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const probationSetupSchema = new Schema({
    uuid: { type: String, default: uuid.v4, required: true },
    setupBy: {
        type: String,
        required: true,
        enum: [
            "department",
            "location",
            "designation",
            "jobType"
        ],
    },
    probationPeriodArray: {
        type: Array,
        item: {
            probationPeriodFor: { type: String, required: true },
            priority: { type: Number, required: true },
            probationPeriod: { type: Number, required: true },
            unit: {
                type: String,
                required: true,
                enum: ["Days", "Weeks", "Months"],
            },
        },
    },
    hasExceptions: { type: Boolean, required: true },
    exceptionArray: {
        type: Array,
        item: {
            criteria: {
                type: String,
                required: true,
                enum: [
                    "id",
                    "department",
                    "location",
                    "designation",
                    "jobType"
                ],
            },
            value: { type: String, required: true },
            priority: { type: Number, required: true },
            probationPeriod: { type: Number, required: true },
            unit: {
                type: String,
                required: true,
                enum: ["Days", "Weeks", "Months"],
            },
            
        }
    },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
},
    { collection: 'probationSetup', minimize: false, timestamps: true },
)

probationSetupSchema.plugin(uniqueValidator)

module.exports = probationSetupSchema