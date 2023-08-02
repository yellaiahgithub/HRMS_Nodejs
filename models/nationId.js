const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const nationalSchema = new Schema(
  {
    //Employee ID, Identification Type, Identification Number, Name as per Document, Expiry Date & Is_Primary
    uuid: { type: String, default: uuid.v4, required: true },
    name: { type: String, required: true},
    employeeUUID: { type: String, required: true},
    identificationType: { type: String, required: true, enum : ['Aadhaar Card','Indian Passport', 'Voter ID Card', 'PAN Card', 'Driving License' , 'SSN']},
    Identification: {type: String, required: true },
    expiry: { type: Date },
    isExpiry: { type: Boolean },
    isPrimary: { type: Boolean , default: true},
    country : { type: String, required: true},
    file:{ type: Object },
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'nationID', minimize: false, timestamps: true },
)

nationalSchema.index({ identificationType: 1, employeeUUID: 1, isActive: 1 },  { unique: true })
nationalSchema.plugin(uniqueValidator)

module.exports =  nationalSchema