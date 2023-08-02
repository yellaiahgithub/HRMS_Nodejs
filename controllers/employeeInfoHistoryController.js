const EmployeeInfoHistoryService = require("../services/employeeInfoHistoryService");
const { switchDB, getDBModel, timelineSchemas } = require("../middlewares/switchDB");

class EmployeeInfoHistory {
  constructor() {}

  findEmployeeInfoHistoryByType = async (req, res, next) => {
    try {
      if (!req.params.type)
        throw new Error("Employee Info History type is required.");
      if (!req.params.employeeUUID)
        throw new Error("Employee UUID is required.");
      let query = {
        type: req.params.type,
        employeeUUID: req.params.employeeUUID,
        isDeleted: false,
      };
      // call method to service
      let result = await EmployeeInfoHistoryService.findEmployeeInfoHistory(
        query,
        req
      );

      if (result?.length == 0) {
        return res
          .status(404)
          .send("EmployeeInfoHistory not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createEmployeeInfoHistory = async (req, res, next) => {
    try {
      console.log(
        "Create EmployeeInfoHistory, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await EmployeeInfoHistoryService.createEmployeeInfoHistory(
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

  updateEmployeeInfoHistory = async (req, res, next) => {
    try {
      console.log(
        "Update EmployeeInfoHistory, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await EmployeeInfoHistoryService.updateEmployeeInfoHistory(
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

  deleteEmployeeInfoHistory = async (req, res, next) => {
    if (!req.params.uuid)
      throw new Error("Employee Info History uuid is required.");
    let query = { uuid: req.params.uuid };
    let employeeInfoHistory =
      await EmployeeInfoHistoryService.findEmployeeInfoHistory(query, req);
    if (employeeInfoHistory?.length == 0) {
      return res
        .status(404)
        .send("EmployeeInfoHistory not found in the database");
    } else {
      if (employeeInfoHistory[0].isDeleted)
        return res.status(400).send("Employee Info History already Deleted.");
      else {
        await EmployeeInfoHistoryService.deleteEmployeeInfoHistory(
          employeeInfoHistory[0],
          req,
          res
        );
      }
    }
  };

  getEmployeeTimeline= async(req,res)=>{
    try{
      let query={};
      if(!req.query.uuid) throw new Error("Please send employee 'uuid'");
     
      const timelineDB = await switchDB(req.subdomain, timelineSchemas);
      const timelineModel = await getDBModel(timelineDB, "timeline");
      let pipeline = [
        {
          $match: {
            employeeUUID: req.query.uuid
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        { $group: 
          {
            _id: {
              year: {
                $year: "$createdAt",
              },
              
            },
            list: { $push: "$$ROOT" },
          }
        }
      ]
      const result = await timelineModel.aggregate(pipeline);
        
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  }
}

module.exports = new EmployeeInfoHistory();
