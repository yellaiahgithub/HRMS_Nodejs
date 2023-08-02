const EmployeeDependantOrBeneficiaryService = require("../services/employeeDependantOrBeneficiaryService");
const apiResponse = require("../helper/apiResponse");
const { generateMail } = require("../utils/mailNotificationUtils");
const { MAIL_NOTIFICATION_TYPE } = require("../constants/commonConstants");
const { switchDB, employeeDependantOrBeneficiarySchema } = require("../middlewares/switchDB");

class EmployeeDependantOrBeneficiary {
  constructor() {}

  findEmployeeDependantOrBeneficiaryByEmployeeId = async (req, res, next) => {
    try {
      if (!req.params.employeeUUID)
        throw new Error("EmployeeDependantOrBeneficiary id is required.");
      let query = { employeeUUID: req.params.employeeUUID };
      // call method to service
      if (req.params.employeeUUID != undefined) {
        query.employeeUUID  = req.params.employeeUUID
    }
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
      let result =
        await EmployeeDependantOrBeneficiaryService.aggregate(
          pipeline,
          req
        );

        if (!result || result.length == 0) {
        return res
          .status(404)
          .send("EmployeeDependantOrBeneficiary not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createEmployeeDependantOrBeneficiary = async (req, res, next) => {
    try {
      console.log(
        "Create EmployeeDependantOrBeneficiary, Data By: " +
          JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp =
        await EmployeeDependantOrBeneficiaryService.createEmployeeDependantOrBeneficiary(
          data,
          req,
          res
        );

      //send Mail
      const inputObj=resp[0]
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      if(resp[0].type.toLowerCase()==="Dependent".toLowerCase()) generateMail(MAIL_NOTIFICATION_TYPE.ADD_DEPENDENT,body,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.ADD_BENEFICIARY,body,req,inputObj)

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateEmployeeDependantOrBeneficiary = async (req, res, next) => {
    try {
      console.log(
        "Update EmployeeDependantOrBeneficiary, Data By: " +
          JSON.stringify(req.body)
      );
      let data = req.body;
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName,employeeDependantOrBeneficiarySchema);
      const employeeDependantOrBeneficiaryModel = await getDBModel(companyDB,"employeeDependantOrBeneficiary");

      // call method to service
      let resp =
        await EmployeeDependantOrBeneficiaryService.updateEmployeeDependantOrBeneficiary(
          data,
          req,
          res
        );
      
      //send Mail
      const inputObj=await employeeDependantOrBeneficiaryModel.findOne({uuid:data.uuid})
      const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      if(inputObj.type.toLowerCase()==="Dependent".toLowerCase()) generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_DEPENDENT,body,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_BENEFICIARY,body,req,inputObj)

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  deleteEmployeeDependantOrBeneficiary = async (req, res) => {
    try {
      console.log(
        "Delete EmployeeDependantOrBeneficiary, Data : " +
          JSON.stringify(req.params)
      );

      const data = req.params;
      if (!data.employeeUUID)
        return apiResponse.notFoundResponse(res, "Please send Employee UUID");
      if (!data.type)
        return apiResponse.notFoundResponse(
          res,
          "Please send Dependant/Beneficiary Type"
        );
      if (!data.name)
        return apiResponse.notFoundResponse(
          res,
          "Please send Dependant/Beneficiary name"
        );
      let query;
      if (req.query.relation) {
        query = {
          employeeUUID: req.params.employeeUUID,
          type: req.params.type,
          name: req.params.name,
          relationWithEmployee: req.query.relation,
        };
      } else {
        query = {
          employeeUUID: req.params.employeeUUID,
          type: req.params.type,
          name: req.params.name,
        };
      }
      const companyName = req.subdomain;
      const companyDB = await switchDB(companyName,employeeDependantOrBeneficiarySchema);
      const employeeDependantOrBeneficiaryModel = await getDBModel(companyDB,"employeeDependantOrBeneficiary");

      const inputObj=await employeeDependantOrBeneficiaryModel.findOne(query)

      // call method to service
      let response = await EmployeeDependantOrBeneficiaryService.delete(
        query,
        req,
        res
      );

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No EmployeeDependantOrBeneficiary found for the Employee Id provided:${data.employeeUUID}`
        );
      }
      else{
              //send Mail
      const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
      if(inputObj.type.toLowerCase()==="Dependent".toLowerCase()) generateMail(MAIL_NOTIFICATION_TYPE.DELETE_DEPENDENT,body,req,inputObj)
      else generateMail(MAIL_NOTIFICATION_TYPE.DELETE_BENEFICIARY,body,req,inputObj)
      }
      return apiResponse.successResponse(
        res,
        "Successfully deleted EmployeeDependantOrBeneficiary"
      );
    } catch (error) {
      console.log(error);
      apiResponse.errorResponse(res, error.message);
    }
  };
  generateDependantCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "Employee_Id" },
        { label: "Relationship_with_Employee", key: "Relationship_with_Employee" },
        { label: "First_Name", key: "First_Name" },
        { label: "Middle_Name", key: "Middle_Name" },
        { label: "Last_Name", key: "Last_Name" },
        { label: "Gender", key: "Gender" },
        { label: "Marital_Status", key: "Marital_Status" },
        { label: "Date_Of_Birth(DD/MM/YYYY)", key: "Date_Of_Birth(DD/MM/YYYY)" },
        { label: "Age_in_Years", key: "Age_in_Years" },
        { label: "Address_Line_One", key: "Address_Line_One" },
        { label: "Address_Line_Two", key: "Address_Line_Two" },
        { label: "Country", key: "Country" },
        { label: "State", key: "State" },
        { label: "City", key: "City" },
        { label: "Pin_Code", key: "Pin_Code" },
        { label: "Is_Disabled", key: "Is_Disabled" },
        { label: "Is_Student", key: "Is_Student" }
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
  createAllDependants = async (req, res, next) => {
    try {
      let data = req.body;

      // call method to service
      let resp = await EmployeeDependantOrBeneficiaryService.createAllDependants(
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

  generateBeneficiaryCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "Employee_Id" },
        { label: "Beneficiary_Type", key: "Beneficiary_Type" },
        { label: "Name", key: "Name" },
        { label: "Address_Line_One", key: "Address_Line_One" },
        { label: "Address_Line_Two", key: "Address_Line_Two" },
        { label: "Country", key: "Country" },
        { label: "State", key: "State" },
        { label: "City", key: "City" },
        { label: "Pin_Code", key: "Pin_Code" },
        { label: "Is_Disabled", key: "Is_Disabled" },
        { label: "Is_Student", key: "Is_Student" });
      const data = {
        CSVHeader: CSVHeader,
      };
      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  createAllBeneficiaries = async (req, res, next) => {
    try {
      let data = req.body;

      // call method to service
      let resp = await EmployeeDependantOrBeneficiaryService.createAllBeneficiaries(
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

module.exports = new EmployeeDependantOrBeneficiary();
