const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const OrgChartSetupSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    companyUUID: { type: String, required: true },
    attributesList: {
      type: Array,
      item: {
        name: { type: String, required: true },
        mappingName: { type: String, required: true },
        isSelected: { type: Boolean, required: true, default: false },
      },
    },
    employeeTypeList: {
      type: Array,
      item: {
        name: { type: String, required: true },
        isSelected: { type: Boolean, required: true, default: false },
      },
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "orgChartSetup", minimize: false, timestamps: true }
);

OrgChartSetupSchema.plugin(uniqueValidator);

module.exports = OrgChartSetupSchema;
