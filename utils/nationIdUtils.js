var moment = require("moment"); // require

class NationIdUtils {
  constructor() {}
  validateNationId = async (nationId, allEmployees) => {
    let errors = [];
    const nationalIdTypeList = ['Aadhaar Card','Indian Passport', 'Voter ID Card', 'PAN Card', 'Driving License' , 'SSN'];

    if (nationId?.name == null || nationId.name?.length == 0) {
      errors.push("Name can not be empty. ");
    }
    if (
      nationId?.identificationType == null ||
      nationId?.identificationType?.length == 0
    ) {
      errors.push("IdentificationType can not be empty. ");
    }  else if (
      !nationalIdTypeList.find(
        (nationalIdType) =>
        nationalIdType.toLowerCase() === nationId?.identificationType.toLowerCase()
      )
    ) {
      errors.push(
        "National Id should be 'Aadhaar Card', 'Indian Passport', 'Voter ID Card', 'PAN Card', 'Driving License' or 'SSN'. \n"
      );
    }
    if (
      nationId?.Identification == null ||
      nationId?.Identification?.length == 0
    ) {
      errors.push("Identification can not be empty. ");
    }
    if (
      nationId?.isPrimary == null ||
      nationId?.isPrimary?.length == 0 ||
      typeof nationId?.isPrimary != "boolean"
    ) {
      errors.push("IsPrimary can not be empty or Invalid. ");
    }
    if (
      nationId?.isExpiry == null ||
      nationId?.isExpiry?.length == 0 ||
      typeof nationId?.isExpiry != "boolean"
    ) {
      errors.push("IsExpiry can not be empty or Invalid. ");
    }
    if (nationId?.isExpiry && nationId?.expiry?.length == 0) {
      errors.push("Expiry Date can not be empty");
    }
    if (nationId?.expiry?.length != 0) {
      if (
        !moment(
          new Date(nationId?.expiry),
          "YYYY-MM-DDT00:00:00.000Z"
        ).isValid()
      ) {
        errors.push("Invalid Expiry Date");
      }
    }
    if (nationId?.country == null || nationId?.country?.length == 0) {
      errors.push("Country can not be empty. ");
    }
    if (nationId?.employeeUUID == null && nationId?.employeeUUID?.length == 0) {
      errors.push('Employee Id can not be Empty." ');
    }
    if (!allEmployees.find((l) => l.id == nationId.employeeUUID)) {
      errors.push(
        "Employee does not exist with the employeeUUID " +
          nationId.employeeUUID +
          ". "
      );
    }

    return errors;
  };

  validateNationIdFile = async (
    entry,
    document,
    allEmployees,
    mappedUploadingData,
    currentEmployeeNationalIdIndex
  ) => {
    let errors = [];
    const fileNameArray = [
      "AadhaarCard",
      "IndianPassport",
      "VoterIDCard",
      "PANCard",
      "DrivingLicense",
      "SSN",
    ];
    const uploadingNationalIdListOfEmployee = mappedUploadingData.get(
      document.employeeId
    );
    if (entry?.name == null || entry?.name?.length == 0) {
      errors.push("Data in zip file can not be empty. ");
    } else {
      if (document.employeeId.length == 0) {
        errors.push(
          "Employee Id can not be empty.Format for file name is 'EMPLOYEEID_CONTENTTYPE'"
        );
      } else if (!allEmployees.find((l) => l.id == document.employeeId)) {
        errors.push(
          "EmployeeId does not exist with the employeeId " +
            document.employeeId +
            ".Format for file name is 'EMPLOYEEID_CONTENTTYPE'"
        );
      }
      if (document.contentType == null || document.contentType.length == 0) {
        errors.push(
          "Content Type can not be empty.Format for file name is 'EMPLOYEEID_CONTENTTYPE'"
        );
      } else if (!fileNameArray.includes(document?.contentType)) {
        errors.push(
          "Invalid content type " +
            document.contentType +
            ".Content Type should be one of these '" +
            fileNameArray.toString() +
            "'. Format for file name is 'EMPLOYEEID_CONTENTTYPE'"
        );
      }
      const duplicateEmployeeNationalIdWithType =
        uploadingNationalIdListOfEmployee.find(
          (nationalId) =>
            nationalId.contentType?.toLowerCase() ===
              document.contentType?.toLowerCase() &&
            currentEmployeeNationalIdIndex != nationalId.index
        );
      if (duplicateEmployeeNationalIdWithType) {
        errors.push(
          "Duplicate National Id Type '" +
            document.contentType +
            "' .Another record also has same Type with EmployeeId'" +
            duplicateEmployeeNationalIdWithType?.employeeId +
            "' in the uploaded file " +
            "\n"
        );
      }
    }
    return errors;
  };
}
module.exports = new NationIdUtils();
