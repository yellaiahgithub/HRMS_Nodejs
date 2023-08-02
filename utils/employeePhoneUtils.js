class EmployeePhoneUtils {
  constructor() {}
  validateEmployeePhone = async (
    employeePhone,
    allEmployees,
    mappedUploadingData,
    mappedExistingData,
    currentEmployeePhoneIndex
  ) => {
    let errors = [];
    const phoneTypeList = ["Mobile", "Residence", "Official", "Public"];
    const uploadingPhonesListOfEmployee = mappedUploadingData.get(
      employeePhone.employeeId
    );
    const existingPhonesListOfEmployee = mappedExistingData
      ? mappedExistingData.get(employeePhone.employeeId)
        ? mappedExistingData.get(employeePhone.employeeId)
        : []
      : [];
    if (
      employeePhone.employeeId == null ||
      employeePhone.employeeId.length == 0
    ) {
      errors.push("EmployeeId can not be empty.\n");
    } else {
      const employee = allEmployees.find(
        (emp) => emp.id === employeePhone.employeeId
      );
      if (!employee) {
        errors.push(
          "Invalid EmployeeId. No employee found with " +
            employeePhone.employeeId +
            " employeeId\n"
        );
      } else {
        const existingEmployeePhoneWithPhoneNumber =
          existingPhonesListOfEmployee.find(
            (phoneData) => phoneData.phoneNumber === employeePhone.phoneNumber
          );
        const duplicateEmployeePhoneWithPhoneNumber =
          uploadingPhonesListOfEmployee.find(
            (phoneData) =>
              phoneData.phoneNumber === employeePhone.phoneNumber &&
              currentEmployeePhoneIndex != phoneData.index
          );
        const existingEmployeePhoneWithType = existingPhonesListOfEmployee.find(
          (phoneData) => phoneData.type.toLowerCase() === employeePhone.type.toLowerCase()
        );
        const duplicateEmployeePhoneWithType =
          uploadingPhonesListOfEmployee.find(
            (phoneData) =>
              phoneData.type.toLowerCase() === employeePhone.type.toLowerCase() &&
              currentEmployeePhoneIndex != phoneData.index
          );
        if (existingEmployeePhoneWithPhoneNumber) {
          errors.push(
            "Phone Number '" +
              existingEmployeePhoneWithPhoneNumber.phoneNumber +
              "' already added for this employee. Kindly Verify" +
              "\n"
          );
        }
        if (duplicateEmployeePhoneWithPhoneNumber) {
          errors.push(
            "Duplicate Phone Number '" +
              employeePhone.phoneNumber +
              "' .Another record with also has same Phone Number'" +
              duplicateEmployeePhoneWithPhoneNumber?.phoneNumber +
              "' in the uploaded file " +
              "\n"
          );
        }
        if (existingEmployeePhoneWithType) {
          errors.push(
            "Phone Type '" +
              existingEmployeePhoneWithType.type +
              "' already added for this employee. Kindly Verify" +
              "\n"
          );
        }
        if (duplicateEmployeePhoneWithType) {
          errors.push(
            "Duplicate Phone Type '" +
              employeePhone.type +
              "' .Another record also has same Phone Type qith phoneNumber '" +
              duplicateEmployeePhoneWithType?.phoneNumber +
              "' in the uploaded file " +
              "\n"
          );
        }
      }
    }

    if (
      employeePhone.phoneNumber == null ||
      employeePhone.phoneNumber.length == 0
    ) {
      errors.push("Phone Number can not be empty.\n");
    }

    if (employeePhone.type == null || employeePhone.type.length == 0) {
      errors.push("Phone Type can not be empty.\n");
    } else if (
      !phoneTypeList.find(
        (phoneType) =>
          phoneType.toLowerCase() === employeePhone.type.toLowerCase()
      )
    ) {
      errors.push(
        'Phone Type should be one of these ["Mobile", "Residence", "Official", "Public"]\n'
      );
    }

    if (
      employeePhone.isPreferred != null &&
      employeePhone.isPreferred.length > 0
    ) {
      if (
        !(
          employeePhone.isPreferred.toLowerCase() === "true".toLowerCase() ||
          employeePhone.isPreferred.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Preferred should be either true or false.\n");
      } else {
        if (employeePhone.isPreferred.toLowerCase() === "true".toLowerCase()) {
          const duplicatePreferredRecordinUploadingData =
            uploadingPhonesListOfEmployee.find(
              (phoneData) =>
                phoneData.isPreferred.toLowerCase() === "true".toLowerCase() &&
                currentEmployeePhoneIndex != phoneData.index
            );
          const duplicatePreferredRecordinExistingData =
            existingPhonesListOfEmployee.find(
              (phoneData) => phoneData.isPreferred
            );
          if (duplicatePreferredRecordinUploadingData) {
            errors.push(
              "Is Preferred is true for another Phone Number " +
                duplicatePreferredRecordinUploadingData.phoneNumber +
                " for this employeeId.\n"
            );
          }
        }
      }
    }

    return errors;
  };

  validatePhoneNumber = (phoneNumber)=>{
    var re = new RegExp("^(\\+\\d{1,2}\\s?)?1?\\-?\\.?\\s?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$");
    return re.test(phoneNumber)
  }
}
module.exports = new EmployeePhoneUtils();
