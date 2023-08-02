const EmployeeEmailService = require("../services/employeeEmailService");
const apiResponse = require("../helper/apiResponse");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");
const { generateMail } = require("../utils/mailNotificationUtils");

class EmployeeEmail {
  constructor() {}

  findEmployeeEmailByEmployeeId = async (req, res, next) => {
    try {
      if (!req.params.employeeUUID) throw new Error("EmployeeEmail id is required.");
      let query = { employeeUUID: req.params.employeeUUID };
      // call method to service
      const pipeline = [
        {
            $match: query
        },
        {
            $lookup: {
                from: 'employee',
                let : { "id": "$employeeUUID" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$uuid", "$$id"] }}},
                    { "$project": {  _id:0, "id": 1}}
                  ],
                as: 'employee',
            }
        },
        {
          $unwind : {
              path:"$employee"
          }
        }
        
      ]
      
      let result = await EmployeeEmailService.aggregate(
        pipeline,
        req
      );

      if (!result || result.length == 0) {
        return res.status(404).send("EmployeeEmail not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createEmployeeEmail = async (req, res, next) => {
    try {
      console.log("Create EmployeeEmail, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await EmployeeEmailService.createEmployeeEmail(data, req, res);

      //send Mail
      const inputObj=resp[0];
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.ADD_EMAIL,body,req,inputObj)  

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateEmployeeEmail = async (req, res, next) => {
    try {
      console.log("Update EmployeeEmail, Data By: " + JSON.stringify(req.body));
      let data = req.body;
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");

      // call method to service
      let resp = await EmployeeEmailService.updateEmployeeEmail(data, req, res);

      //send Mail
      const inputObj=await employeeEmailModel.findOne({uuid:data.uuid})
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_EMAIL,body,req,inputObj)  

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  deleteEmployeeEmail = async (req, res) => {
    try {
      console.log("Delete EmployeeEmail, Data : " + JSON.stringify(req.params));

      const data = req.params;
      const body = req.body;
      if (!data.uuid)
        return apiResponse.notFoundResponse(res, "Please send uuid");
      let query = { uuid: data.uuid};

      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeeEmailSchema);
      const employeeEmailModel = await getDBModel(companyDB, "employeeEmail");
      const inputObj=await employeeEmailModel.findOne(query)

      // call method to service
      let response = await EmployeeEmailService.delete(query, body, req, res);

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No EmployeeEmail found for the uuid Id provided:${data.uuid}`
        );
      }
      else{
        const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
        generateMail(MAIL_NOTIFICATION_TYPE.DELETE_EMAIL,body,req,inputObj)  
      }
      return apiResponse.successResponse(
        res,
        "Successfully deleted EmployeeEmail"
      );
    } catch (error) {
      console.log(error);
      apiResponse.errorResponse(res, error.message);
    }
  };
  generateCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "Employee_Id" },
        { label: "Email_Type", key: "Email_Type" },
        { label: "Email_Address", key: "Email_Address" },
        { label: "Is_Primary", key: "Is_Primary" }
      );
      const data = {
        CSVHeader: CSVHeader,
      };
      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  createAllEmployeeEmails = async (req, res, next) => {
    try {
      let data = req.body;

      // call method to service
      let resp = await EmployeeEmailService.createAllEmployeeEmails(
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

module.exports = new EmployeeEmail();
