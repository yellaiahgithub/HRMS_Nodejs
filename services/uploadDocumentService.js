const {
  switchDB,
  getDBModel,
  employeeSchema,
  nationIDSchema,
  uploadResultsSchema,
} = require("../middlewares/switchDB");
var moment = require("moment");
const employeeUtils = require("../utils/employeeUtils");
const nationIdUtils = require("../utils/nationIdUtils");
const StorageController = require("../controllers/StorageController");
const StorageService = require("./StorageService");
const fs = require("fs");
const employeeService = require("./employeeService");
const AdmZip = require("adm-zip");
const path = require("path");

class UploadDocumentService {
  constructor() {}

  uploadDocuments = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      let forValidationOnly = data?.forValidationOnly;
      let file = req.files.file?.[0];
      let filePath = file.path;
      let CSVHeader = [];
      let uploadedData = JSON.parse(data.data);
      let createUploadResult = [];
      const localDir = "controllers/mnt/repo/HRMS";
      const allEmployees = await employeeService.findEmployeesByQuery(
        {
          isActive: true,
        },
        req
      );
      const employeeDB = await switchDB(req.subdomain, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");

      const NationIdDB = await switchDB(req.subdomain, nationIDSchema);
      const nationIdModel = await getDBModel(NationIdDB, "nationID");

      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );

      CSVHeader.push(
        { label: "EmployeeId", key: "employeeId" },
        { label: "FileName", key: "fileName" }
      );
      if (forValidationOnly == "false" || forValidationOnly == false) {
        let uploadingData = {
          type: data.documentType,
          uploadedBy: req?.subdomain,
          fileName: file.originalname,
          errorFileName: file.originalname.split(".")[0] + ".csv",
          status: "InProgress",
          uploadedData: uploadedData,
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

      let entries = [];

      try {
        const zip = new AdmZip(filePath);
        const outputDir = `${path.parse(filePath).name}_extracted`;
        zip.extractAllTo(localDir, true);

        entries = zip.getEntries();
      } catch (e) {
        console.log(`Something went wrong. ${e}`);
      }
      const mappedUploadingData = new Map();
      for (let i = 0; i < uploadedData?.length > 0; i++) {
        const nationalId = uploadedData[i];
        if (mappedUploadingData.get(nationalId.employeeId)) {
          mappedUploadingData.set(nationalId.employeeId, [
            ...mappedUploadingData.get(nationalId.employeeId),
            { ...nationalId, index: i },
          ]);
        } else {
          mappedUploadingData.set(nationalId.employeeId, [
            { ...nationalId, index: i },
          ]);
        }
      }
      let errors = [];
      try {
        let savedData = [];
        for (let i = 0; i < entries?.length > 0; i++) {
          const entry = entries[i];
          const fileName = entry.name;
          const zipFileName = entry.entryName.split("/", 2)[0];
          const documentName = fileName?.split(".", 2);
          const employeeDocumenntDetails = documentName[0].split("_", 2);
          const extension = documentName?.[1];
          const employeeId = employeeDocumenntDetails?.[0];
          const contentType = employeeDocumenntDetails?.[1];
          const document = {
            employeeId: employeeId,
            contentType: contentType,
            fileName: fileName,
          };
          const empUUID = allEmployees.find((e) => e.id == employeeId)?.uuid;
          if (data.documentType === "NationalId") {
            errors = await nationIdUtils.validateNationIdFile(
              entry,
              document,
              allEmployees,
              mappedUploadingData,
              i
            );
            if (errors.length > 0) {
              const errorData = { ...document };
              errorData.errors = errors;
              errorList.push(errorData);
              errorCount++;
            } else if (
              forValidationOnly == "false" ||
              forValidationOnly == false
            ) {
              const exstingRecord = await nationIdModel.findOne({
                employeeId: empUUID,
                identificationType: document.contentType,
              });
              if (exstingRecord) {
                let filePathS3 =
                  localDir + "/" + zipFileName + "/" + entries[i].name;
                const reqFileObj = {
                  subdomain: req.subdomain,
                  file: {
                    path: filePathS3,
                    originalname: entries[i].name,
                  },
                  body: {
                    employeeId: empUUID,
                    documentType: data.documentType,
                  },
                };
                const uploaded = await StorageController.uploadFileS3(
                  reqFileObj,
                  res,
                  "onlyData"
                );
                if (uploaded) {
                  savedData = await nationIdModel.updateOne(
                    {
                      employeeId: empUUID,
                      identificationType: document.contentType,
                    },
                    { $set: { file: uploaded } },
                    { upsert: false }
                  );
                  if (savedData) {
                    sucessList.push(document);
                    sucessfullyAddedCount++;
                  }
                }
              } else {
                const errorData = { ...document };
                errorData.errors = [
                  "National Id '" +
                    document.contentType +
                    "' Record not available for this employee to upload this record",
                ];
                errorList.push(errorData);
                errorCount++;
              }
            }
          }
          if (data.documentType === "EmployeeProfileImage") {
            errors = await employeeUtils.validateEmployeeImage(
              entry,
              document,
              allEmployees
            );
            if (errors.length > 0) {
              const errorData = { ...document };
              errorData.errors = errors;
              errorList.push(errorData);
              errorCount++;
            } else if (
              forValidationOnly == "false" ||
              forValidationOnly == false
            ) {
              let filePathS3 =
                localDir + "/" + zipFileName + "/" + entries[i].name;
              const reqFileObj = {
                subdomain: req.subdomain,
                file: {
                  path: filePathS3,
                  originalname: entries[i].name,
                },
                body: {
                  employeeId: empUUID,
                  documentType: "profile",
                },
              };
              const uploaded = await StorageController.uploadFileS3(
                reqFileObj,
                res,
                "onlyData"
              );
              if (uploaded) {
                savedData = await employeeModel.updateOne(
                  { uuid: empUUID },
                  { $set: { file: uploaded } },
                  { upsert: false }
                );
                if (savedData) {
                  sucessList.push(document);
                  sucessfullyAddedCount++;
                }
              }
            }
          }
        }
      } catch (error) {
        const errorData = { ...data };
        errorData.errors = error?.errors?.code
          ? error?.errors?.code?.properties?.message
          : error.message;
        errorList.push(errorData);
        errorCount++;
        console.log("error occured while saving record");
        console.log("err", error);
      }

      console.log("processed record");

      if (forValidationOnly == "false" || forValidationOnly == false) {
        const updateUploadResult = await uploadResultsModel.updateOne(
          { _id: createUploadResult[0]._id },
          {
            $set: {
              status:
                sucessfullyAddedCount == uploadedData.length
                  ? "Sucess"
                  : "Rejected",
              errorData: errorList,
              errorFileName: file.originalname.split(".")[0] + ".csv",
              updatedAt: new Date(),
            },
          },
          { upsert: false, runValidators: true }
        );
      }
      console.log();
      return {
        totalRecords: data?.length,
        sucessfullyAdded: sucessfullyAddedCount,
        errorCount: errorCount,
        errorData: errorList,
        sucessData: sucessList,
        data: data,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new UploadDocumentService();
