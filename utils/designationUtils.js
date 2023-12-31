var moment = require("moment"); // require

class DesignationUtils {
  constructor() {}
  validateDesignation = async (
    designation,
    uploadingData,
    isAutoGeneratedDesignationId,
    allDesignations,
    currentDesignationIndex
  ) => {
    let errors = [];

    if (!isAutoGeneratedDesignationId) {
      if (designation.id == null || designation.id.length == 0) {
        errors.push("Designation Id can not be empty.\n");
      } else {
        const existingDesignationWithId = allDesignations.find(
          (desc) => desc.id === designation.id
        );
        const duplicateDesignationWithId = uploadingData.find(
          (desc, index) =>
            desc.id === designation.id && currentDesignationIndex != index
        );
        if (existingDesignationWithId) {
          errors.push(
            "Designation Id '" +
              designation.id +
              "' already alloted to designation '" +
              existingDesignationWithId?.name +
              "'\n"
          );
        }
        if (duplicateDesignationWithId) {
          errors.push(
            "Duplicate Designation Id '" +
              designation.id +
              "' .Another record with designation name '" +
              duplicateDesignationWithId?.name +
              "' also has same designationId in the uploaded file " +
              "\n"
          );
        }
      }
    }
    if (designation.name == null || designation.name.length == 0) {
      errors.push("Designation Name can not be empty.\n");
    }
    if (designation.isOneToOne != null && designation.isOneToOne.length > 0) {
      if (
        !(
          designation.isOneToOne.toLowerCase() === "true".toLowerCase() ||
          designation.isOneToOne.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is One-To-One should be either true or false.\n");
      }
    }
    if (designation.isCritical != null && designation.isCritical.length > 0) {
      if (
        !(
          designation.isCritical.toLowerCase() === "true".toLowerCase() ||
          designation.isCritical.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Critical should be either true or false.\n");
      }
    }
    if (designation.asOfDate == null || designation.asOfDate.length == 0) {
      errors.push("As of Date can not be empty.\n");
    }
    if (!moment(designation.asOfDate, "DD/MM/YYYY").isValid()) {
      errors.push("Invalid As Of Date");
    }

    return errors;
  };
}
module.exports = new DesignationUtils();
