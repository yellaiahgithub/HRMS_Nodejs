class EmployeeEmailUtils {
  constructor() {}
  validateEmployeeEmail = async (
    employeeEmail,
    allEmployees,
    mappedUploadingData,
    mappedExistingData,
    currentEmployeeEmailIndex
  ) => {
    let errors = [];
    const emailTypeList = ["Personal", "Confidential", "Official"];
    const uploadingEmailsListOfEmployee = mappedUploadingData.get(
      employeeEmail.employeeId
    );
    const existingEmailsListOfEmployee = mappedExistingData
      ? mappedExistingData.get(employeeEmail.employeeId)
        ? mappedExistingData.get(employeeEmail.employeeId)
        : []
      : [];
    if (
      employeeEmail.employeeId == null ||
      employeeEmail.employeeId.length == 0
    ) {
      errors.push("EmployeeId can not be empty.\n");
    } else {
      const employee = allEmployees.find(
        (emp) => emp.id === employeeEmail.employeeId
      );
      if (!employee) {
        errors.push(
          "Invalid EmployeeId. No employee found with " +
            employeeEmail.employeeId +
            " employeeId\n"
        );
      } else {
        const existingEmployeeEmailWithEmail =
          existingEmailsListOfEmployee.find(
            (emailData) => emailData.email === employeeEmail.email
          );
        const duplicateEmployeeEmailWithEmail =
          uploadingEmailsListOfEmployee.find(
            (emailData) =>
              emailData.email === employeeEmail.email &&
              currentEmployeeEmailIndex != emailData.index
          );
        const existingEmployeeEmailWithType = existingEmailsListOfEmployee.find(
          (emailData) =>
            emailData.type.toLowerCase() === employeeEmail.type.toLowerCase()
        );
        const duplicateEmployeeEmailWithType =
          uploadingEmailsListOfEmployee.find(
            (emailData) =>
              emailData.type.toLowerCase() ===
                employeeEmail.type.toLowerCase() &&
              currentEmployeeEmailIndex != emailData.index
          );
        if (existingEmployeeEmailWithEmail) {
          errors.push(
            "Email Address '" +
              existingEmployeeEmailWithEmail.email +
              "' already added for this employee. Kindly Verify" +
              "\n"
          );
        }
        if (duplicateEmployeeEmailWithEmail) {
          errors.push(
            "Duplicate Email Address '" +
              employeeEmail.email +
              "' .Another record with also has same Email Address'" +
              duplicateEmployeeEmailWithEmail?.email +
              "' in the uploaded file " +
              "\n"
          );
        }
        if (existingEmployeeEmailWithType) {
          errors.push(
            "Email Type '" +
              existingEmployeeEmailWithType.type +
              "' already added for this employee. Kindly Verify" +
              "\n"
          );
        }
        if (duplicateEmployeeEmailWithType) {
          errors.push(
            "Duplicate Email Type '" +
              employeeEmail.type +
              "' .Another record also has same Email Type with Email Address'" +
              duplicateEmployeeEmailWithType?.email +
              "' in the uploaded file " +
              "\n"
          );
        }
      }
    }

    if (employeeEmail.email == null || employeeEmail.email.length == 0) {
      errors.push("Email Address can not be empty.\n");
    }

    if (employeeEmail.type == null || employeeEmail.type.length == 0) {
      errors.push("Email Type can not be empty.\n");
    } else if (
      !emailTypeList.find(
        (emailType) =>
          emailType.toLowerCase() === employeeEmail.type.toLowerCase()
      )
    ) {
      errors.push(
        'Email Type should be one of these ["Personal", "Confidential", "Official"]\n'
      );
    }

    if (
      employeeEmail.isPreferred != null &&
      employeeEmail.isPreferred.length > 0
    ) {
      if (
        !(
          employeeEmail.isPreferred.toLowerCase() === "true".toLowerCase() ||
          employeeEmail.isPreferred.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Preferred should be either true or false.\n");
      } else {
        if (employeeEmail.isPreferred.toLowerCase() === "true".toLowerCase()) {
          const duplicatePreferredRecordinUploadingData =
            uploadingEmailsListOfEmployee.find(
              (emailData) =>
                emailData.isPreferred.toLowerCase() === "true".toLowerCase() &&
                currentEmployeeEmailIndex != emailData.index
            );
          const duplicatePreferredRecordinExistingData =
            existingEmailsListOfEmployee.find(
              (emailData) => emailData.isPreferred
            );
          if (duplicatePreferredRecordinUploadingData) {
            errors.push(
              "Is Preferred is true for another Email " +
                duplicatePreferredRecordinUploadingData.email +
                " for this employeeId.\n"
            );
          }
        }
      }
    }

    return errors;
  };

  validateEmail = (email)=>{
    var re = new RegExp("[a-z0-9]+@[a-z]+\\.[a-z]{2,3}");
    return re.test(email)
  }
}
module.exports = new EmployeeEmailUtils();
