var moment = require("moment"); // require

class CertificateOrLicenseUtils {
    constructor() { }
    validateCertificateOrLicense = async (
        type, // license or certificate
        certificateOrLicense,
        allEmployees
    ) => {
        let errors = [];

        if(type == "License") {
            if (certificateOrLicense?.nameOfTheCertificateOrLicense == null || certificateOrLicense?.nameOfTheCertificateOrLicense?.length == 0) {
                errors.push("Name of the license can not be empty. ");
            }
        } else if (type == "Certificate") {
            if (certificateOrLicense?.nameOfTheCertificateOrLicense == null || certificateOrLicense?.nameOfTheCertificateOrLicense?.length == 0) {
                errors.push("Name of the certificate can not be empty. ");
            }
        }
        // if (certificateOrLicense?.status == null || certificateOrLicense?.status?.length == 0) {
        //     errors.push("Status can not be empty. ");
        // }
        if (certificateOrLicense?.levelOfCertification == null || certificateOrLicense?.levelOfCertification?.length == 0) {
            errors.push("level of license can not be empty. ");
        }
        if (certificateOrLicense?.validity == null || certificateOrLicense?.validity?.length == 0) {
            errors.push("Validity can not be empty");
        }
        if (certificateOrLicense?.issuingAuthority == null || certificateOrLicense?.issuingAuthority?.length == 0) {
            errors.push("Issuing authority can not be empty");
        }

        if ((certificateOrLicense?.effectiveDate && certificateOrLicense?.effectiveDate?.length == 0)) {
            errors.push("Effective date can not be empty");
        }
        if (certificateOrLicense?.effectiveDate?.length != 0) {
            if (!moment(certificateOrLicense?.effectiveDate, "DD/MM/YYYY").isValid()) {
                errors.push("Invalid effective date");
            }
        }
        
        if ((certificateOrLicense?.dateOfIssue && certificateOrLicense?.dateOfIssue?.length == 0)) {
            errors.push("Date of issue can not be empty");
        }
        if (certificateOrLicense?.dateOfIssue?.length != 0) {
            if (!moment(certificateOrLicense?.dateOfIssue, "DD/MM/YYYY").isValid()) {
                errors.push("Invalid date of issue");
            }
        }
        
        if ((certificateOrLicense?.validityFrom && certificateOrLicense?.validityFrom?.length == 0)) {
            errors.push("validityFrom can not be empty");
        }
        if (certificateOrLicense?.validityFrom?.length != 0) {
            if (!moment(certificateOrLicense?.validityFrom, "DD/MM/YYYY").isValid()) {
                errors.push("Invalid validityFrom date");
            }
        }

        if (["Temporary", "Renewable", "Others"].includes(certificateOrLicense?.validity) && certificateOrLicense?.validityUntil?.length == 0) {
            errors.push("ValidityUntil can not be empty");
        }
        if (["Temporary", "Renewable", "Others"].includes(certificateOrLicense?.validity) && certificateOrLicense?.validityUntil?.length != 0) {
            if (!moment(new Date(certificateOrLicense?.validityUntil), "DD/MM/YYYY").isValid()) {
                errors.push("Invalid ValidityUntil date");
            }
        }

        if (certificateOrLicense?.employeeId == null && certificateOrLicense?.employeeId?.length == 0) {
            errors.push(
                'Employee Id can not be Empty." '
            );
        }
        if (!allEmployees.find(l => l.id == certificateOrLicense.employeeId)) {
            errors.push(
                "Employee does not exist with the employeeId " + certificateOrLicense.employeeId + ". "
            );
        }


        return errors;
    };

    
}
module.exports = new CertificateOrLicenseUtils();
