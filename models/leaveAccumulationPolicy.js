const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { LEAVEACCUMULATIONPOLICY_RULES_CARRYFORWARDLIMIT_UNIT_LIST, LEAVEACCUMULATIONPOLICY_RULES_ACCUMULATIONLIMIT_UNIT_LIST } = require("../constants/commonConstants");
const { Schema } = mongoose;

const leaveAccumulationPolicySchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    id: { type: String, required: true, unique: true },
    leaveTypeUUID: { type: String, required: true },
    description: { type: String, required: true },
    rules:{ type:Array, 
      item : {
        fromService:{ type:Number,required:true},
        toService : { type:Number, required:true},
        carryForwardLimit:{ type:Object, 
          item:{
            value:{type:Number, required:true},
            unit:{type:String, required:true,enum:LEAVEACCUMULATIONPOLICY_RULES_CARRYFORWARDLIMIT_UNIT_LIST}
          },required:true 
        },
        allowAccumulation:{type:Boolean, default:false},
        accumulationLimit:{ type:Object, 
          item:{
            value:{type:Number, required:true},
            unit:{type:String, required:true,enum:LEAVEACCUMULATIONPOLICY_RULES_ACCUMULATIONLIMIT_UNIT_LIST}
          }
        },
        onReachingLimit:{type:String}
      }
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "leaveAccumulationPolicy", minimize: false, timestamps: true }
);

leaveAccumulationPolicySchema.plugin(uniqueValidator);

module.exports =  leaveAccumulationPolicySchema;
