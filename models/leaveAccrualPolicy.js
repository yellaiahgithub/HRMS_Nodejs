const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { LEAVEACCRUALPOLICY_RULES_ELIGIBLELEAVE_UNIT_LIST, LEAVEACCRUALPOLICY_RULES_ACCRUALAFTER_UNIT_LIST, LEAVEACCRUALPOLICY_RULES_ACCRUALFREQUENCY_LIST, LEAVEACCRUALPOLICY_ACCRUALCRITERIA_LIST } = require("../constants/commonConstants");
const { Schema } = mongoose;

const leaveAccrualPolicySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    id: { type: String, required: true, unique: true },
    leaveTypeUUID: { type: String, required: true },
    accrualCriteria: { type: String, required: true, enum:LEAVEACCRUALPOLICY_ACCRUALCRITERIA_LIST },
    description: { type: String, required: true },
    rules:{ type:Array, 
      item : {
        fromService:{ type:Number,required:true},
        toService : { type:Number, required:true},
        accrualFrequency:{ type: String, required: true, enum:LEAVEACCRUALPOLICY_RULES_ACCRUALFREQUENCY_LIST },
        accrualAfter:{ type:Object, 
          item:{
            value:{type:Number, required:true},
            unit:{type:String, required:true, enum:LEAVEACCRUALPOLICY_RULES_ACCRUALAFTER_UNIT_LIST}
          },required:true 
        },
        eligibleLeave:{ type:Object, 
          item:{
            count:{type:Number, required:true},
            unit:{type:String, required:true,enum:LEAVEACCRUALPOLICY_RULES_ELIGIBLELEAVE_UNIT_LIST}
          }
        },
      }
    },    
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "leaveAccrualPolicy", minimize: false, timestamps: true }
);

leaveAccrualPolicySchema.plugin(uniqueValidator);

module.exports =  leaveAccrualPolicySchema;
