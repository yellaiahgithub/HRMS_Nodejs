const UploadDocumentService = require("../services/uploadDocumentService.js");
const apiResponse = require("../helper/apiResponse");
const employeeService = require("../services/employeeService.js");
const StorageController = require("./StorageController.js");
const uploadDocumentService = require("../services/uploadDocumentService.js");

class UploadDocument {
  constructor() {}

  uploadDocument = async (req, res, next) => {
    try {
      let data = req.body;
      if (data?.forValidationOnly == undefined) throw new Error("forValidationOnly is required.");
      // call method to service
      let resp = await uploadDocumentService.uploadDocuments(
        data,
        req,
        res
      );

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new UploadDocument();
