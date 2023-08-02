const mongoose = require('mongoose');
const { Schema } = mongoose;

const sessionMongoSchema = new Schema(
{
  sessionUUID: { type: String, required: true },
  userUUID: { type: String, required: true },
  serverSecret: { type: String, required: true },
  uuid: { type: String, required: true },
  isActive: { type: Boolean },
  lastActivityTime: { type: String }
},
{ collection: 'sessions', minimize: false,})

// uuid, sessionUUID, serverSecret, userUUID, createdAt, updatedAt
sessionMongoSchema.index({ sessionUUID: 1, userId: -1 })
// sessionMongoSchema.plugin(timestamps)
// // 12 hours TTL for all session record
sessionMongoSchema.index({ createdAt: 1 }, { expireAfterSeconds: 43200 })

// Should in different database
module.exports = sessionMongoSchema
