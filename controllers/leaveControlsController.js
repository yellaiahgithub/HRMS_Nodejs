const LeaveControlsService = require("../services/leaveControlsService");

class LeaveControls {
  constructor() {}

  findLeaveControls = async (req, res, next) => {
    try {
      let query = {}
      let result = await LeaveControlsService.findLeaveControls(query, req, res);

      if (!result) {
        return res.status(404).send("LeaveControls not found in the database");
      }
      return res.status(200).send(result[0]);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createLeaveControls = async (req, res, next) => {
    try {
      console.log("Create LeaveControls, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await LeaveControlsService.createLeaveControls(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateLeaveControls = async (req, res, next) => {
    try {
      console.log("Update LeaveControls, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await LeaveControlsService.updateLeaveControls(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new LeaveControls();
