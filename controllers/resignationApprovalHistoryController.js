const ResignationApprovalHistoryService = require("../services/resignationApprovalHistoryService");

class ResignationApprovalHistory {
  constructor() {}

  //findbyuuid api and findAll api
  find = async (req, res, next) => {
    try {
      let result;
      let query = {};
      if (req.query.uuid) {
        query = { uuid: req.query.uuid };
      }
      result = await ResignationApprovalHistoryService.findResignationApprovalHistory(query, req);
      if (result?.length == 0) {
        return res.status(404).send("ResignationApprovalHistory not found in the database");
      }
      if (req.query.uuid) {
        return res.status(200).send(result[0]);
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  //create api
  createResignationApprovalHistory = async (req, res, next) => {
    try {
      console.log(
        "Create ResignationApprovalHistory, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await ResignationApprovalHistoryService.createResignationApprovalHistory(
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

  //update api
  updateAndCreateNextHistory = async (req, res, next) => {
    try {
      console.log(
        "Update ResignationApprovalHistory, Data By: " + JSON.stringify(req.body)
      );
      if(!req.body?.resignationUUID) throw new Error("resignationUUID is required")
      if(!req.body?.approverUUID) throw new Error("approverUUID is required")
      let data = req.body;

      // call method to service
      let resp = await ResignationApprovalHistoryService.updateAndCreateNextHistory(
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

module.exports = new ResignationApprovalHistory();
