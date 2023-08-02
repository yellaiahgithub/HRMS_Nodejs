const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const { Schema } = mongoose;

const jobGradeSchema = new Schema(
  {
    uuid: { type: String, default: uuid.v4, required: true },
    gradeId: { type: String, required: true, unique: true },
    gradeName: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    status: { type: Boolean, default: true },
    description: { type: String },
    gradeSalaryRangeMinimum: { type: String },
    gradeSalaryRangeMidPoint: { type: String },
    gradeSalaryRangeMaximum : { type: String },
    progressionByService: { type: Boolean },
    minimumService : { type: String },
    maximumService : { type: String },
    minimumNumberOfReviews :  { type: Number},
    progressionByReviewsRatings : { type: Boolean },
    minimumRating : { type: String },
    averageRating : { type: String },
    finalRating : { type: String },
    progressionByAge : { type: Boolean, default: true},
    minimumAge : { type: Number },
    nextGrade: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { collection: "jobGrade", minimize: false, timestamps: true }
);

jobGradeSchema.plugin(uniqueValidator);

module.exports = jobGradeSchema;
