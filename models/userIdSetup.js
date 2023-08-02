const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const userIdSetupSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    emailId: { type: Boolean, required: true},
    employeeId: { type: Boolean, required: true},
    customUserId: { type: Boolean, required: true},

    combination : {
      type: Array,
      items: [
        {
          name : {type : String },
          sequenceNumber : {type : Number },
          length : {type : Number }          
        }
      ]
    },
    
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'userIdSetup', minimize: false, timestamps: true },
)

userIdSetupSchema.plugin(uniqueValidator)

module.exports = userIdSetupSchema;
