const EmployeePhoneService = require("../services/employeePhoneService");
const apiResponse = require("../helper/apiResponse");
const { generateMail } = require("../utils/mailNotificationUtils");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");
const { switchDB, employeePhoneSchema } = require("../middlewares/switchDB");

class EmployeePhone {
  constructor() {}

  findEmployeePhoneByEmployeeId = async (req, res, next) => {
    try {
      if (!req.params.employeeUUID) throw new Error("EmployeePhone id is required.");
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
      let result = await EmployeePhoneService.aggregate(
        pipeline,
        req
      );

      if (!result || result.length == 0) {
        return res.status(404).send("EmployeePhone not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createEmployeePhone = async (req, res, next) => {
    try {
      console.log("Create EmployeePhone, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await EmployeePhoneService.createEmployeePhone(data, req, res);
      
      //send Mail
      const inputObj=resp[0];
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_PHONE,body,req,inputObj)  

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateEmployeePhone = async (req, res, next) => {
    try {
      console.log("Update EmployeePhone, Data By: " + JSON.stringify(req.body));
      let data = req.body;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");

      // call method to service
      let resp = await EmployeePhoneService.updateEmployeePhone(data, req, res);

      //send Mail
      const inputObj=await employeePhoneModel.findOne({uuid:data.uuid})
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_PHONE,body,req,inputObj)  


      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  deleteEmployeePhone = async (req, res) => {
    try {
      console.log("Delete EmployeePhone, Data : " + JSON.stringify(req.params));

      const data = req.params;
      const body = req.body;
      if (!data.uuid)
        return apiResponse.notFoundResponse(res, "Please send uuid");
      let query = { uuid: data.uuid};
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName, employeePhoneSchema);
      const employeePhoneModel = await getDBModel(companyDB, "employeePhone");
      const inputObj=await employeePhoneModel.findOne(query)

      // call method to service
      let response = await EmployeePhoneService.delete(query, body, req, res);

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No EmployeePhone found for the uuid provided:${data.uuid}`
        );
      }
      else{

        //send Mail
        const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
        generateMail(MAIL_NOTIFICATION_TYPE.DELETE_PHONE,body,req,inputObj)  
    }
      return apiResponse.successResponse(
        res,
        "Successfully deleted EmployeePhone"
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
        { label: "Phone_Type", key: "Phone_Type" },
        { label: "Phone_Number", key: "Phone_Number" },
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
  createAllEmployeePhones = async (req, res, next) => {
    try {
      let data = req.body;

      // call method to service
      let resp = await EmployeePhoneService.createAllEmployeePhones(
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

module.exports = new EmployeePhone();
