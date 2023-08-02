const mongoose = require('mongoose')
const uuid = require('uuid')
const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = mongoose

const permissionSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    id : { type: Number, required: true, unique: true},
    name: { type: String, required: true, unique: true},
    description : { type: String, required: true},
    isActive: { type: Boolean , default: true},
    createdAt: { type: Date },
    updatedAt: { type: Date }
  },
  { collection: 'permissions', minimize: false, timestamps: true },
)

permissionSchema.plugin(uniqueValidator)

module.exports =  permissionSchema