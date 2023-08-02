const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const resignationApprovalHistorySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    resignationUUID: { type: String, required: true },
    approvalStatus: { type: String },
    approverUUID: { type: String, required: true },
    levelOfApprover: { type: String, required: true },
    approver: { type: String, default: false },
    isActive: { type: Boolean, default: true },
    comments: { type: String },
    acceptanceCriteria: {
      type: String,

      enum: [
        "As per Policy",
        "As per employee's date",
        "As per manager's date",
        null
      ],
    },
    relievingDate: { type: Date },
    isDirectEmployee: { type: Boolean, default: false },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    collection: "resignationApprovalHistory",
    minimize: false,
    timestamps: true,
  }
);

resignationApprovalHistorySchema.plugin(uniqueValidator);

module.exports = resignationApprovalHistorySchema;
