var moment = require("moment"); // require

class JobBandUtils {
  constructor() {}

  validateJobBand = async (jobBand) => {
    let errors = [];
    if (jobBand.bandId == null || jobBand.bandId.length == 0) {
      errors.push("Band Id can not be empty.\n");
    }
    if (jobBand.bandName == null || jobBand.bandName.length == 0) {
      errors.push("Band Name can not be empty.\n");
    }
    if (jobBand.effectiveDate == null || jobBand.effectiveDate.length == 0) {
      errors.push("EffectiveDate can not be empty.\n");
    }
    return errors;
  };
  validateUploadedJobBand = async (
    jobBand,
    uploadingData,
    allJobBands,
    currentJobBandIndex
  ) => {
    let errors = [];
    if (jobBand.bandId == null || jobBand.bandId.length == 0) {
      errors.push("Band Id can not be empty.\n");
    } else {
      const existingJobBandWithId = allJobBands.find(
        (tempJobBand) => tempJobBand.bandId === jobBand.bandId
      );
      const duplicateJobBandWithId = uploadingData.find(
        (tempJobBand, index) =>
          tempJobBand.bandId === jobBand.bandId && currentJobBandIndex != index
      );
      if (existingJobBandWithId) {
        errors.push(
          "JobBand Id '" +
            jobBand.bandId +
            "' already alloted to jobBand '" +
            existingJobBandWithId?.bandName +
            "'\n"
        );
      }
      if (duplicateJobBandWithId) {
        errors.push(
          "Duplicate JobBand Id '" +
            jobBand.bandId +
            "' .Another record with jobBand name '" +
            duplicateJobBandWithId?.bandName +
            "' also has same jobBandId in the uploaded file " +
            "\n"
        );
      }
    }
    if (jobBand.bandName == null || jobBand.bandName.length == 0) {
      errors.push("Band Name can not be empty.\n");
    }
    if (jobBand.effectiveDate == null || jobBand.effectiveDate.length == 0) {
      errors.push("EffectiveDate can not be empty.\n");
    } else if (!moment(jobBand.effectiveDate, "DD/MM/YYYY").isValid()) {
      errors.push("Invalid Effective Date");
    }

    return errors;
  };
}
module.exports = new JobBandUtils();
