const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');

const { Schema } = mongoose

const UploadFileSchema = new Schema(
  {
    uuid: { type: String, unique: true, default: uuid.v4, required: true },
    fileType: { type: String },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String },
    updatedAt: { type: String },
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { collection: 'uploadedFiles', minimize: false, timestamps: true },
)
UploadFileSchema.index({ fileName: 1, filePath: 1, isActive: 1 },  { unique: true })
UploadFileSchema.plugin(uniqueValidator);

module.exports =  UploadFileSchema
