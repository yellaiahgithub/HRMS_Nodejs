var moment = require("moment"); // require

class EmployeeAddressUtils {
  constructor() {}
  validateEmployeeAddress = async (
    employeeAddress,
    allEmployees,
    mappedUploadingData,
    mappedExistingData,
    currentEmployeeAddressIndex
  ) => {
    const addressTypeList = ["Home", "Hostel", "Permanent", "Temporary"];
    let errors = [];
    const uploadingAddressesListOfEmployee = mappedUploadingData.get(
      employeeAddress.employeeId
    );
    const existingAddressesListOfEmployee = mappedExistingData
      ? mappedExistingData.get(employeeAddress.employeeId)
        ? mappedExistingData.get(employeeAddress.employeeId)
        : []
      : [];
    if (
      employeeAddress.employeeId == null ||
      employeeAddress.employeeId.length == 0
    ) {
      errors.push("EmployeeId can not be empty.\n");
    } else {
      const employee = allEmployees.find(
        (emp) => emp.id === employeeAddress.employeeId
      );
      if (!employee) {
        errors.push(
          "Invalid EmployeeId. No employee found with " +
            employeeAddress.employeeId +
            " employeeId\n"
        );
      } else {
        const duplicateTypeinUploadingData =
          uploadingAddressesListOfEmployee.find(
            (address) =>
              address.addressType.toLowerCase() ==
                employeeAddress.addressType.toLowerCase() &&
              address.index != currentEmployeeAddressIndex
          );
        if (duplicateTypeinUploadingData) {
          errors.push(
            "Two addresses can not have same Address Type '" +
              employeeAddress.addressType +
              "' for same employeeId\n"
          );
        }
        const duplicateTypeinExistingData =
          existingAddressesListOfEmployee.find(
            (address) =>
              address.addressType.toLowerCase() ==
              employeeAddress.addressType.toLowerCase()
          );
        if (duplicateTypeinExistingData) {
          errors.push(
            "Address with Address Type '" +
              employeeAddress.addressType +
              "' is already added for same employeeId\n"
          );
        }
      }
    }

    if (
      employeeAddress.address1 == null ||
      employeeAddress.address1.length == 0
    ) {
      errors.push("Address Line One can not be empty.\n");
    }
    if (
      employeeAddress.address2 == null ||
      employeeAddress.address2.length == 0
    ) {
      errors.push("Address Line Two can not be empty.\n");
    }
    if (employeeAddress.city == null || employeeAddress.city.length == 0) {
      errors.push("City can not be empty.\n");
    }
    if (employeeAddress.state == null || employeeAddress.state.length == 0) {
      errors.push("State can not be empty.\n");
    }
    if (
      employeeAddress.country == null ||
      employeeAddress.country.length == 0
    ) {
      errors.push("Country can not be empty.\n");
    }
    if (employeeAddress.PIN == null || employeeAddress.PIN.length == 0) {
      errors.push("PIN can not be empty.\n");
    }
    if (
      employeeAddress.effectiveDate == null ||
      employeeAddress.effectiveDate.length == 0
    ) {
      errors.push("Effective Date can not be empty.\n");
    }
    if (!moment(employeeAddress.effectiveDate, "DD/MM/YYYY").isValid()) {
      errors.push("Invalid Effective Date");
    }
    if (
      employeeAddress.addressType == null ||
      employeeAddress.addressType.length == 0
    ) {
      errors.push("Address Type can not be empty.\n");
    } else if (
      !addressTypeList.find(
        (addressType) =>
        addressType.toLowerCase() === employeeAddress.addressType.toLowerCase()
      )
    ) {
      errors.push(
        'Address Type should be one of these ["Home", "Hostel", "Permanent", "Temporary"]\n'
      );
    }

    if (
      employeeAddress.isPrimary != null &&
      employeeAddress.isPrimary.length > 0
    ) {
      if (
        !(
          employeeAddress.isPrimary.toLowerCase() === "true".toLowerCase() ||
          employeeAddress.isPrimary.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Primary should be either true or false.\n");
      } else {
        if (employeeAddress.isPrimary.toLowerCase() === "true".toLowerCase()) {
          const duplicatePrimaryRecordinUploadingData =
            uploadingAddressesListOfEmployee.find(
              (addressData) =>
                addressData.isPrimary.toLowerCase() === "true".toLowerCase() &&
                currentEmployeeAddressIndex != addressData.index
            );
          const duplicatePrimaryRecordinExistingData =
            existingAddressesListOfEmployee.find(
              (addressData) => addressData.isPrimary
            );
          if (duplicatePrimaryRecordinUploadingData) {
            errors.push(
              "Is Primary is true for another Address " +
                " for this employeeId.\n"
            );
          }
        }
      }
    }

    return errors;
  };
}
module.exports = new EmployeeAddressUtils();
