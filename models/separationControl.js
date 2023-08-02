const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const separationControlSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    miscellineous: {
      type: Object,
      item: {
        autoApproveByManager: { type: Boolean, required: true },
        autoApproveByAdmin: { type: Boolean, required: true },
        allowEarlyExit: { type: Boolean, required: true },
        allowEmployeeResignationDate: { type: Boolean, required: true },
        resignationReasons: { 
          type: Array,
          item: {
            code: String,
            name: String
          },
          required: true
        },
      },
    },
    //add fields
    approvalPath: {
      type: Array,
      item: {
        criteria: { type: String, required: true },
        level: {
          type: Number,
          required: true,
          enum: [1, 2, 3, 4, 5],
        },
        approver: {
          type: String,
          required: true,
          enum: [
            "Reporting Manager",
            "L2 Manager",
            "L3 Manager",
            "Admin",
            "Role",
          ],
        },
        approverRoleUUID: { type: String, required: false },
      },
    },
    noticePeriodSetup: {
      type: Object,
      item: {
        setupBy: {
          type: String,
          required: true,
          enum: [
            "department",
            "location",
            "designation",
            "jobType",
            "jobStatus",
          ],
        },
        noticePeriodArray: {
          type: Array,
          item: {
            noticePeriodFor: { type: String, required: true },
            priority: { type: Number, required: true },
            noticePeriod: { type: Number, required: true },
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
                "jobType",
                "jobStatus",
              ],
            },
            value: { type: String, required: true },
            priority: { type: Number, required: true },
            noticePeriod: { type: Number, required: true },
            unit: {
              type: String,
              required: true,
              enum: ["Days", "Weeks", "Months"],
            },
          },
        },
      },
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "separationControl", minimize: false, timestamps: true }
);

separationControlSchema.plugin(uniqueValidator);

module.exports = separationControlSchema;
