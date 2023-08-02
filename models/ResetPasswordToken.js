const mongoose = require('mongoose')

const resetPasswordTokenMongoSchema = new mongoose.Schema({
  userUUID: { type: String, required: true },
  token: { type: String, required: true },
  isExpired: { type: Boolean }
},
{ collection: 'resetPasswordToken', minimize: false, timestamps: true },
)

module.exports =  resetPasswordTokenMongoSchema