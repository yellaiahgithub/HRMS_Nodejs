const StorageController = require("../controllers/StorageController");
const { switchDB, getDBModel, certificateOrlicenseSchema, uploadResultsSchema } = require("../middlewares/switchDB");
const CertificateOrLicenseUtils = require("../utils/certificateOrLicenseUtils.js");
const employeeService = require("./employeeService");
var moment = require("moment"); // require

class CertificateOrlicenseService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for certificateOrlicense create', data);
            
            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            const result = await certificateOrlicenseModel.insertMany([data], { runValidators: true })
            return result;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    aggregate = async (pipeline, req) => {
        try {
            console.log('Get CertificateOrlicense, Data By: ' + JSON.stringify(pipeline))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            return await certificateOrlicenseModel.aggregate(pipeline)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (query, req, res) => {
        try {
            console.log('Get CertificateOrlicense, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            return await certificateOrlicenseModel.find(query)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findCertificateOrlicenseById = async (query, req, res) => {
        try {
            console.log('Get CertificateOrlicense, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            return await certificateOrlicenseModel.find(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (query, data, req, res) => {
        try {
            console.log('Update CertificateOrlicense, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            // find and update record in mongoDB
            return await certificateOrlicenseModel.updateOne(query, { $set: data }, { upsert: false })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    delete = async (query, req) => {
        try {
            console.log("Data for CertificateOrlicense Detail update", query);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            return await certificateOrlicenseModel.findOneAndDelete(
                query
            );
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };

    createAllLicenses = async (data, req, res) => {
        try {
          let errorList = [];
          let errorCount = 0;
          let sucessList = [];
          let sucessfullyAddedCount = 0;
          const forValidationOnly = data?.forValidationOnly
          const type =  data?.type
          let CSVHeader = [];
          let createUploadResult = []
          const allEmployees = await employeeService.findEmployeesByQuery(
            {
              isActive: true,
            },
            // {
            //   _id:0,
            //   id:1,
            //   uuid:1,
            // },
            req
          );
         
            const LicenseDB = await switchDB(req.subdomain, certificateOrlicenseSchema);
            const uploadResultsDB = await switchDB(
              req.subdomain,
              uploadResultsSchema
            );
            const licenseModel = await getDBModel(LicenseDB, "certificateOrlicense");
            const uploadResultsModel = await getDBModel(uploadResultsDB, "uploadResults");
            
            CSVHeader.push(
                  { label: "Employee_Id", key: "employeeId" },
                  { label: "Name_Of_The_"+type, key: "nameOfTheCertificateOrLicense" },
                  { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate" },
                  { label: "Level_Of_"+type, key: "levelOfCertification" },
                  { label: "Validity", key: "validity" },
                  { label: "Date_Of_Issue(DD/MM/YYYY)", key: "dateOfIssue" },
                  { label: "Validity_From(DD/MM/YYYY)", key: "validityFrom" },
                  { label: "Validity_Until(DD/MM/YYYY)", key: "validityUntil" },
                  { label: "Issuing_Authority", key: "issuingAuthority" },
            );
            if(!forValidationOnly) {
              let uploadingData = {
                type: type,
                uploadedBy: req?.subdomain ,
                fileName: data.fileName,
                errorFileName: data.fileName,
                status: "InProgress",
                uploadedData: data.data,
                createdAt: new Date(),
                csvHeader: CSVHeader,
              };
              createUploadResult = await uploadResultsModel.insertMany(
                [uploadingData],
                {
                  runValidators: true,
                }
              );
            }
          for (let i = 0; i < data.data?.length > 0; i++) {
            const license = data.data[i];
            
            console.log("processing the record: ", i + 1);
            const errors = await CertificateOrLicenseUtils.validateCertificateOrLicense(
              type,
              license,
              allEmployees
            );
            if (errors.length > 0) {
              const errorData = { ...license };
              errorData.errors = errors;
              errorList.push(errorData);
              errorCount++;
            } else {
              try {
                if(!forValidationOnly) {
                  // store type
                  if(data?.type) {
                    license["type"] = data.type
                  }
                  // convert date in iSO format
                  if(license?.effectiveDate) {
                    license["effectiveDate"] = new Date(moment(license.effectiveDate, "DD/MM/YYYY"));
                  }
                  if(license?.dateOfIssue) {
                    license["dateOfIssue"] = new Date(moment(license.dateOfIssue, "DD/MM/YYYY"));
                  }
                  if(license?.validityFrom) {
                    license["validityFrom"] = new Date(moment(license.validityFrom, "DD/MM/YYYY"));
                  }
                  if(license?.validityUntil) {
                    license["validityUntil"] = new Date(moment(license.validityUntil, "DD/MM/YYYY"));
                  }
                 
                  // if(license?.employeeId && allEmployees?.length>0) {
                  //   license.employeeId = allEmployees.find(e => e.id == license.employeeId)?.uuid
                  // }
    
                  
                  const licenseData = {
                    ...license,
                  };
    
                  const savedLicenses = await licenseModel.insertMany(
                    [licenseData],
                    { runValidators: true }
                  );
                  if (savedLicenses.length > 0) {
                    savedLicenses["errors"] = [];
                    sucessList.push(savedLicenses);
                    sucessfullyAddedCount++;
                  }
                } else {
                  const errorData = { ...license };
                  errorData.errors = [];
                  errorList.push(errorData);
                }
              } catch (error) {
                const errorData = { ...license };
                errorData.errors = error?.errors?.code ? error?.errors?.code?.properties?.message : error.message; 
                errorList.push(errorData);
                errorCount++;
                console.log("error occured while saving record", i + 1);
                console.log("err", error);
              }
            }
            console.log("processed record", i + 1);
          }
          if(!forValidationOnly) {
            const updateUploadResult = await uploadResultsModel.updateOne(
              { _id: createUploadResult[0]._id },
              {
                $set: {
                  status:
                    sucessfullyAddedCount == data.data.length ? "Sucess" : "Rejected",
                  errorData: errorList,
                  updatedAt: new Date(),
                },
              },
              { upsert: false, runValidators: true }
            );
          }
          console.log();
          return {
            totalRecords: data.data.length,
            sucessfullyAdded: sucessfullyAddedCount,
            errorCount: errorCount,
            errorData: errorList,
            sucessData: sucessList,
            data: data.data,
          };
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      };

}

module.exports = new CertificateOrlicenseService()