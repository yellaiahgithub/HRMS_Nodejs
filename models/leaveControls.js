const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const leaveControlsSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    allowIfManagerUnassigned: { type: Boolean, default: false },
    defaultLeaveApprover: { type: String },
    adminCanOverrideAllRules: { type: Boolean, default: false },
    managerCanOverrideAllRules: { type: Boolean, default: false },
    approvalRequiredForCancellation: { type: Boolean, default: false },
    cancellationApprovalPath: {
      type: Array,
      item: {
        level: {
          type: String,
          required: true,
          enum: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
        },
        approver: {
          type: String,
          required: true,
          enum: ["Reporting Manager", "L2", "Role"],
        },
        approverRoleUUID: { type: String },
      },
    },
    autoApproveManagerProxy: { type: Boolean, default: false },
    autoApproveAdminProxy: { type: Boolean, default: false },
    isLimitationOnAdjustLeaves: { type: Boolean, default: false },
    adjustLeavesLimit: {
      type: Object,
      item: {
        value: { type: Number },
        unit: { type: String, enum: ["Days", "Weeks", "Months"] },
      },
    },
    enteringReasonIsMandatory: { type: Boolean, default: false },
    allowLeaveDuringNoticePeriod: { type: Boolean, default: false },
    leaveDuringNoticePeriod: {
      type: Object,
      item: {
        maxDays: { type: Number },
        leaveTypes: { type: Array },
      },
    },
    showTeamCalendar: { type: Boolean, default: false },
    teamLeaveRequest: {
      type: Object,
      item: {
        statusApplied: { type: Boolean, default: false },
        statusApproved: { type: Boolean, default: false },
        statusRejected: { type: Boolean, default: false },
        statusCancelled: { type: Boolean, default: false },
        statusTaken: { type: Boolean, default: false },
      },
    },
    showManagerLeaveStatus: { type: Boolean, default: false },
    managerLeaveRequest: {
      type: Object,
      item: {
        statusApplied: { type: Boolean, default: false },
        statusApproved: { type: Boolean, default: false },
        statusRejected: { type: Boolean, default: false },
        statusCancelled: { type: Boolean, default: false },
        statusTaken: { type: Boolean, default: false },
      },
    },
    approvalPath: {
      type: Array,
      item: {
        level: {
          type: String,
          required: true,
          enum: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
        },
        approver: {
          type: String,
          required: true,
          enum: ["Reporting Manager", "L2", "Role"],
        },
        approverRoleUUID: { type: String },
      },
    },
    remindUnapprovedLeaves: { type: Boolean, default: false },
    remindUnapprovedLeavesBefore: { type: Number },
    keepReminding: { type: Boolean, default: false },
    keepRemindingFrequency: { type: Number },
    escalationRequired: { type: Boolean, default: false },
    escalation: {
      type: Array,
      item: {
        level: {
          type: String,
          required: true,
          enum: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
        },
        criteria1: {
          type: Number,
          required: true,
          enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        criteria2: {
          type: String,
          required: true,
          enum: ["Reminder", "Escalation"],
        },
        to: { type: String, required: true, enum: ["L2", "Role"] },
        toRoleUUID: { type: String },
      },
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "leaveControls", minimize: false, timestamps: true }
);

leaveControlsSchema.plugin(uniqueValidator);

module.exports = leaveControlsSchema;
