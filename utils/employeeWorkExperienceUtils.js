var moment = require("moment"); // require

class WorkExperienceUtils {
  constructor() {}
  validateWorkExperience = async (workExperience, allEmployees) => {
    const employementTypeList = ["Full-Time", "Part-Time", "Internship", "Trainee", "Freelance", "Contract based"]
    let errors = [];
    if (
      workExperience.employeeId == null ||
      workExperience.employeeId.length == 0
    ) {
      errors.push("EmployeeId can not be empty.\n");
    } else {
      const employee = allEmployees.find(
        (emp) => emp.id === workExperience.employeeId
      );
      if (!employee) {
        errors.push(
          "Invalid EmployeeId. No employee found with " +
            workExperience.employeeId +
            " employeeId\n"
        );
      }
    }
    if (workExperience.title == null || workExperience.title.length == 0) {
      errors.push("Title can not be empty.\n");
    }
    if (
      workExperience.employmentType == null ||
      workExperience.employmentType.length == 0
    ) {
      errors.push("Employment Type can not be empty.\n");
    } else if(
      !employementTypeList.find(
        (employementType) =>
        employementType.toLowerCase() === workExperience.employmentType.toLowerCase()
      )
    ) {
      errors.push(
        'Employement Type should be one of these [Full-Time, Part-Time, Internship, Trainee, Freelance, Contract based]'
      )
    }
    if (
      workExperience.companyName == null ||
      workExperience.companyName.length == 0
    ) {
      errors.push("Company Name can not be empty.\n");
    }
    if (workExperience.city == null || workExperience.city.length == 0) {
      errors.push("City can not be empty.\n");
    }
    if (workExperience.state == null || workExperience.state.length == 0) {
      errors.push("State can not be empty.\n");
    }
    if (workExperience.country == null || workExperience.country.length == 0) {
      errors.push("Country can not be empty.\n");
    }
    if (
      workExperience.startDateMonth == null ||
      workExperience.startDateMonth.length == 0
    ) {
      errors.push("Start Date Month can not be empty.\n");
    }
    if (
      workExperience.startDateYear == null ||
      workExperience.startDateYear.length == 0
    ) {
      errors.push("Start Date Year can not be empty.\n");
    }

    if (
      workExperience.endDateMonth == null ||
      workExperience.endDateMonth.length == 0
    ) {
      errors.push("End Date Month can not be empty.\n");
    }
    if (
      workExperience.endDateYear == null ||
      workExperience.endDateYear.length == 0
    ) {
      errors.push("End Date Year can not be empty.\n");
    }
    if ( workExperience.startDateYear > workExperience.endDateYear) {
      errors.push("Start Date Year cannot be greater than End Date Year.\n");
    }
    if (
      workExperience.reportingManagerName == null ||
      workExperience.reportingManagerName.length == 0
    ) {
      errors.push("Reporting Manager Name can not be empty.\n");
    }
    if (
      workExperience.designation == null ||
      workExperience.designation.length == 0
    ) {
      errors.push("Designation can not be empty.\n");
    }
    if (
      workExperience.reasonForLeaving == null ||
      workExperience.reasonForLeaving.length == 0
    ) {
      errors.push("Reason for Leaving can not be empty.\n");
    }
    return errors;
  };
}
module.exports = new WorkExperienceUtils();
