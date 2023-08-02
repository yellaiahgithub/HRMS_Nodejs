const StorageService = require("../services/StorageService");
const logger = require('../common/logging/services/logger').loggers.get('general')
const fs = require('fs');
const { switchDB, getDBModel, uploadedFilesSchema } = require("../middlewares/switchDB");

const apiResponse = require("../helper/apiResponse");

class StorageController {
  constructor() { }

  getFile = async (req, res, next) => {
    logger.info('Get Attachment, Data By: ' + JSON.stringify(req.query))
    try {

      
      if (!req?.query?.path) throw new Error("Path not found")
      
      if (req?.query?.path) {
        let storageResp = await StorageService.get(req?.query?.path);
        if (typeof storageResp === 'string') {
          return apiResponse.errorResponse(res, "File not found: " + storageResp);
        }
        else {
          res.set({
            'Content-Type': 'image/jpeg',
            //'Content-Disposition': `attachment; filename="${response[0].fileName}"`
          });
          let buf = Buffer.from(storageResp.Body);
          let base64 = buf.toString("base64");
          res.send(base64);
        }
      } else {
        apiResponse.errorResponse(res, "No Path Found")
      }
    } catch (error) {
      apiResponse.errorResponse(res, error.message)
    }
  }


  uploadFileS3 = async (req, res, responseType) => {
    try {
      logger.info('Upload File, Data By: ' + JSON.stringify(req.body))


      const filePath = req.file.path
      const file = req.file
      if (!req.file) {
        res.json({ error_code: 1, err_desc: "No file passed" });
        return;
      }

      // add date and time in file-name
      
      let filePathS3 = filePath;
      if(req.body?.employeeUUID && req.body?.documentType) {
        filePathS3 = req.subdomain + '/' + req.body.employeeUUID + '/'+ req.body?.documentType
      } else if(req?.body?.documentType == 'company') {
        filePathS3 = req?.body?.documentType + '/logo'
      } else if(req?.body?.documentType == 'profile') { 
        filePathS3 = req?.body?.documentType
      } else if(req?.body?.documentType) { 
        filePathS3 = req.subdomain + '/' + req?.body?.documentType
      }

      const extension = file.originalname.split('.').pop()
      const name = file.originalname.split('.').slice(0, -1).join('.')
      const finalName = name +'-' + new Date().toISOString() + '.' + extension
      const fileKey = filePathS3 + '/' + finalName

      //store file in s3
      const fileContent = fs.readFileSync(req.file.path);
      let storageResp = await StorageService.uploadFileS3(fileKey, fileContent);
      fs.unlinkSync(req.file.path); //DeleteFile Irrespective of status in server
      if (storageResp == 200) {
        const data = {
          fileType: extension.toLowerCase(),
          filePath: filePathS3,
          fileName: finalName,
          fileSize: file?.size
        }
        console.log("Successfully uploaded data to" + fileKey);
        if(responseType && responseType == "onlyData") {
          return data;
        } else {
          return res.status(200).send(data);
        }

      }
      else {
        return apiResponse.errorResponse(res, `Failed Uploading File : ${storageResp}`);
      }
    } catch (error) {
      logger.error(error)
      apiResponse.errorResponse(res, error.message)
    }
  }

  deleteFileS3 = async (req, res) => {
    try {
      logger.info('Delete file, Data : ' + JSON.stringify(req.params))

      if (!req.query.path) return apiResponse.notFoundResponse(res, "Please send path");
      

      // let query = {};
      // query.path = path;
      // query.isActive = true;
      // const fileData = await UploadModel.findOne(query);

      let storageResp = await StorageService.delete(req.query.path);
      if (storageResp == 200) {
        return apiResponse.successResponse(res, "Successfully deleted file")
      }
      else {
        return apiResponse.errorResponse(res, `Failed deleting file : ${storageResp}`);
      }
    } catch (error) {
      logger.error(error)
      apiResponse.errorResponse(res, error.message)
    }
  }
}

module.exports = new StorageController()