var moment = require("moment"); // require

class EmployeeDependantOrBeneficiaryUtils {
  constructor() {}
  validateDependant = async (
    dependant,
    allEmployees,
    mappedUploadingData,
    mappedExistingData,
    currentDependantIndex
  ) => {
    let errors = [];
    let selectedEmployee;
    const uploadingDependantsListOfEmployee = mappedUploadingData.get(
      dependant.Employee_Id
    );
    const existingDependantsListOfEmployee = mappedExistingData
      ? mappedExistingData.get(dependant.employeeUUID)
        ? mappedExistingData.get(dependant.employeeUUID)
        : []
      : [];

    const relationshipListArray = [
      "Brother",
      "Daughter",
      "Father",
      "Father-In-Law",
      "Mother",
      "Mother-In-Law",
      "Sister",
      "Son",
      "Spouse",
    ];
    const uniqueRelationShip = [
      "Father",
      "Father-In-Law",
      "Mother",
      "Mother-In-Law",
      "Spouse",
    ];
    const maleRelationShip = ["Brother", "Father", "Father-In-Law", "Son"];
    const femaleRelationShip = [
      "Daughter",
      "Mother",
      "Mother-In-Law",
      "Sister",
    ];
    const singleRelationShip = ["Brother", "Father", "Mother", "Sister"];
    const genders = ["Male", "Female", "Unknown"];

    const maritalStatusList = [
      "Married",
      "Divorced",
      "Single",
      "Widowed",
      "Unknown",
    ];

    if (dependant.Employee_Id == null || dependant.Employee_Id.length == 0) {
      errors.push("EmployeeId can not be empty.\n");
    } else {
      selectedEmployee = allEmployees.find(
        (emp) => emp.id === dependant.Employee_Id
      );
      console.log(selectedEmployee);
      if (!selectedEmployee) {
        errors.push(
          "Invalid EmployeeId. No employee found with '" +
            dependant.Employee_Id +
            "' Employee Id.\n"
        );
      }
    }
    if (
      dependant.Relationship_with_Employee == null ||
      dependant.Relationship_with_Employee.length == 0
    ) {
      errors.push("Relationship with Employee can not be empty.\n");
    } else {
      if (
        uniqueRelationShip.find(
          (relation) =>
            relation.toLowerCase() ===
            dependant.Relationship_with_Employee.toLowerCase()
        )
      ) {
        const existingDependantWithUniqueRelation =
          existingDependantsListOfEmployee.find(
            (tempDependant) =>
              tempDependant.relationWithEmployee.toLowerCase() ===
              dependant.Relationship_with_Employee.toLowerCase()
          );
        const duplicateDependantWithUniqueRelation =
          uploadingDependantsListOfEmployee.find(
            (tempDependant) =>
              tempDependant.Relationship_with_Employee.toLowerCase() ===
                dependant.Relationship_with_Employee.toLowerCase() &&
              currentDependantIndex != tempDependant.index
          );
        if (existingDependantWithUniqueRelation) {
          errors.push(
            "Another Dependant '" +
              existingDependantWithUniqueRelation.name +
              "' exists with same Relation '" +
              existingDependantWithUniqueRelation.relationWithEmployee +
              "' for this employee. Kindly Verify" +
              ".\n"
          );
        }
        if (duplicateDependantWithUniqueRelation) {
          errors.push(
            "Duplicate Relation '" +
              dependant.Relationship_with_Employee +
              "' .Another Dependant also has same Relation '" +
              duplicateDependantWithUniqueRelation?.Relationship_with_Employee +
              "' in the uploaded file " +
              ".\n"
          );
        }
      }
      if (selectedEmployee.gender.toLowerCase() === "Male".toLowerCase()) {
        if (
          dependant.Relationship_with_Employee.toLowerCase() ==
          "Spouse".toLowerCase()
        ) {
          if (dependant.Gender.toLowerCase() != "Female".toLowerCase()) {
            errors.push(
              "Gender Should be female for relation '" +
                dependant.Relationship_with_Employee +
                "'.Since the employee's Gender is Male.\n"
            );
          }
          if (
            dependant.Marital_Status != null &&
            dependant.Marital_Status.length > 0
          ) {
            if (
              dependant.Marital_Status.toLowerCase() != "Married".toLowerCase()
            ) {
              errors.push(
                "Marital Status Should be Married for relation " +
                  dependant.Relationship_with_Employee +
                  " .\n"
              );
            }
          }
        }
      } else if (
        selectedEmployee.gender.toLowerCase() === "Female".toLowerCase()
      ) {
        if (
          dependant.Relationship_with_Employee.toLowerCase() ==
          "Spouse".toLowerCase()
        ) {
          if (dependant.Gender.toLowerCase() != "Male".toLowerCase()) {
            errors.push(
              "Gender Should be male for relation '" +
                dependant.Relationship_with_Employee +
                "'.Since the employee's Gender is Female.\n"
            );
          }
          if (
            dependant.Marital_Status != null &&
            dependant.Marital_Status.length > 0
          ) {
            if (
              dependant.Marital_Status.to.toLowerCase() !=
              "Married".toLowerCase()
            ) {
              errors.push(
                "Marital Status Should be Married for relation " +
                  dependant.Relationship_with_Employee +
                  " .\n"
              );
            }
          }
        }
      }
      if (
        selectedEmployee.maritalStatus?.toLowerCase() === "Single".toLowerCase()
      ) {
        if (
          singleRelationShip.find(
            (relation) =>
              (relation.toLowerCase() ===
                dependant.Relationship_with_Employee.toLowerCase()) ===
              null
          )
        ) {
          errors.push(
            "Marital Status of Employee is Single.Can only have Dependant Relations of these '" +
              singleRelationShip.toString() +
              "' .\n"
          );
        }
      }
      if (
        maleRelationShip.find(
          (relation) =>
            relation.toLowerCase() ===
            dependant.Relationship_with_Employee.toLowerCase()
        )
      ) {
        if (dependant.Gender != null && dependant.Gender.length > 0) {
          if (dependant.Gender.toLowerCase() != "Male".toLowerCase()) {
            errors.push(
              "Gender Should be male for relation " +
                dependant.Relationship_with_Employee +
                " .\n"
            );
          }
        }
      } else if (
        femaleRelationShip.find(
          (relation) =>
            relation.toLowerCase() ===
            dependant.Relationship_with_Employee.toLowerCase()
        )
      ) {
        if (dependant.Gender != null && dependant.Gender.length > 0) {
          if (dependant.Gender.toLowerCase() != "Female".toLowerCase()) {
            errors.push(
              "Gender Should be female for relation" +
                dependant.Relationship_with_Employee +
                " .\n"
            );
          }
        }
      } else if (
        relationshipListArray.find(
          (relation) =>
            (relation.toLowerCase() ===
              dependant.Relationship_with_Employee.toLowerCase()) ==
            null
        )
      ) {
        errors.push(
          "Invalid Relationship with Employee.Relation should be one of these '" +
            relationshipListArray.toString() +
            "' .\n"
        );
      }
    }
    if (dependant.First_Name == null || dependant.First_Name.length == 0) {
      errors.push("First Name can not be empty.\n");
    }
    if (dependant.Gender == null || dependant.Gender.length == 0) {
      errors.push("Gender can not be empty.\n");
    }
    if (
      !(
        dependant["Date_Of_Birth(DD/MM/YYYY)"] == null ||
        dependant["Date_Of_Birth(DD/MM/YYYY)"].length == 0
      ) &&
      !moment(dependant["Date_Of_Birth(DD/MM/YYYY)"], "DD/MM/YYYY").isValid()
    ) {
      errors.push("Invalid Date of Birth");
    }

    if (
      dependant.Marital_Status == null ||
      dependant.Marital_Status.length == 0
    ) {
      errors.push("Marital Status can not be empty.\n");
    }
    if (
      dependant.Address_Line_One == null ||
      dependant.Address_Line_One.length == 0
    ) {
      errors.push("Address Line 1 can not be empty.\n");
    }

    if (
      dependant.Address_Line_Two == null ||
      dependant.Address_Line_Two.length == 0
    ) {
      errors.push("Address Line 2 can not be empty.\n");
    }
    if (dependant.Country == null || dependant.Country.length == 0) {
      errors.push("Country can not be empty.\n");
    }
    if (dependant.State == null || dependant.State.length == 0) {
      errors.push("State can not be empty.\n");
    }
    if (dependant.City == null || dependant.City.length == 0) {
      errors.push("City can not be empty.\n");
    }
    if (dependant.Pin_Code == null || dependant.Pin_Code.length == 0) {
      errors.push("Pin Code can not be empty.\n");
    }
    if (dependant.Is_Disabled != null && dependant.Is_Disabled.length > 0) {
      if (
        !(
          dependant.Is_Disabled.toLowerCase() === "true".toLowerCase() ||
          dependant.Is_Disabled.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Disabled should be either true or false.\n");
      }
    }
    if (dependant.Is_Student != null && dependant.Is_Student.length > 0) {
      if (
        !(
          dependant.Is_Student.toLowerCase() === "true".toLowerCase() ||
          dependant.Is_Student.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Student should be either true or false.\n");
      }
    }
    return errors;
  };
  validateBeneficiary = async (beneficiary, allEmployees) => {
    let errors = [];
    if (
      beneficiary.employeeUUID == null ||
      beneficiary.employeeUUID.length == 0
    ) {
      errors.push("EmployeeId can not be empty.\n");
    } else {
      const employee = allEmployees.find(
        (emp) => emp.id === beneficiary.employeeUUID
      );
      if (!employee) {
        errors.push(
          "Invalid EmployeeId. No employee found with " +
            beneficiary.employeeUUID +
            " employeeUUID\n"
        );
      }
    }
    if (
      beneficiary.beneficiaryType == null ||
      beneficiary.beneficiaryType.length == 0
    ) {
      errors.push("Beneficiary Type can not be empty.\n");
    }
    if (beneficiary.name == null || beneficiary.name.length == 0) {
      errors.push("Name can not be empty.\n");
    }

    if (
      beneficiary.addressLineOne == null ||
      beneficiary.addressLineOne.length == 0
    ) {
      errors.push("Address Line 1 can not be empty.\n");
    }

    if (
      beneficiary.addressLineTwo == null ||
      beneficiary.addressLineTwo.length == 0
    ) {
      errors.push("Address Line 2 can not be empty.\n");
    }
    if (beneficiary.country == null || beneficiary.country.length == 0) {
      errors.push("Country can not be empty.\n");
    }
    if (beneficiary.state == null || beneficiary.state.length == 0) {
      errors.push("State can not be empty.\n");
    }
    if (beneficiary.city == null || beneficiary.city.length == 0) {
      errors.push("City can not be empty.\n");
    }
    if (beneficiary.pinCode == null || beneficiary.pinCode.length == 0) {
      errors.push("Pin Code can not be empty.\n");
    }
    if (beneficiary.disabled != null && beneficiary.disabled.length > 0) {
      if (
        !(
          beneficiary.disabled.toLowerCase() === "true".toLowerCase() ||
          beneficiary.disabled.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Student should be either true or false.\n");
      }
    }
    if (beneficiary.isStudent != null && beneficiary.isStudent.length > 0) {
      if (
        !(
          beneficiary.isStudent.toLowerCase() === "true".toLowerCase() ||
          beneficiary.isStudent.toLowerCase() === "false".toLowerCase()
        )
      ) {
        errors.push("Is Disabled should be either true or false.\n");
      }
    }
    dependant.errors = errors;
    return errors;
  };
}
module.exports = new EmployeeDependantOrBeneficiaryUtils();
