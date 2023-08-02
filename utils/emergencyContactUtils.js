var moment = require("moment"); // require

class EmergencyContactUtils {
  constructor() {}
  validateEmergencyContact = async (
    emergencyContact,
    allEmployees
  ) => {
    let errors = [];
        
    if (emergencyContact?.contactName == null || emergencyContact.contactName?.length == 0) {
      errors.push("Emergency contactName can not be empty. ");
    }
    if (emergencyContact?.relationship == null || emergencyContact?.relationship?.length == 0) {
      errors.push("relationship can not be empty. ");
    }
    if (emergencyContact?.phoneNo == null || emergencyContact?.phoneNo?.length == 0) {
        errors.push("phone Number can not be empty. ");
    } 
    if (emergencyContact?.isPrimary == null || emergencyContact?.isPrimary?.length == 0) {
        errors.push("isPrimary can not be empty. ");
    }
    if (emergencyContact?.addressLine1 == null || emergencyContact?.addressLine1?.length == 0) {
        errors.push("AddressLine1 can not be empty. ");
    } 
    if (emergencyContact?.addressLine2 == null || emergencyContact?.addressLine2?.length == 0) {
        errors.push("AddressLine2 can not be empty. ");
    }
    if (emergencyContact?.country == null || emergencyContact?.country?.length == 0) {
        errors.push("Country can not be empty. ");
    }
    if (emergencyContact?.state == null || emergencyContact?.state?.length == 0) {
        errors.push("State can not be empty. ");
    }
    if (emergencyContact?.city == null || emergencyContact?.city?.length == 0) {
        errors.push("City can not be empty. ");
    }
    if (emergencyContact?.pinCode == null || emergencyContact?.pinCode?.length == 0) {
        errors.push("PINCODE can not be empty. ");
    }
    if (!emergencyContact?.employeeId && emergencyContact?.employeeId?.length == 0) {
        errors.push(
          'Employee Id can not be Empty." '
        );
    }
    if (!allEmployees.find(l => l.id == emergencyContact.employeeId)) {
        errors.push(
            "Employee does not exist with the employeeId " + emergencyContact.employeeId + ". "
        );
    }
    
    
    return errors;
  };
}
module.exports = new EmergencyContactUtils();
