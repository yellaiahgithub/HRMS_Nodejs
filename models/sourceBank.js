const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const SourceBankSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    bankUUID: { type: String, required: true },
    branchUUID: { type: String, required: true },
    ifscCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    accountType: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    currency: { type: String, required: false },
    targetBranches: {
      type: Array,
      item: {
        bankUUID: { type: String, required: true },
        branchUUID: { type: String, required: true },
      },
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "sourceBank", minimize: false, timestamps: true }
);
SourceBankSchema.index({ bankUUID: 1, branchUUID: 1 }, { unique: true });
SourceBankSchema.plugin(uniqueValidator);

module.exports = SourceBankSchema;
