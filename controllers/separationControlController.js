const SeparationControlService = require("../services/separationControlService");

class SeparationControl {
  constructor() {}

  //findAll api
  find = async (req, res, next) => {
    try {
      let result;
      result = await SeparationControlService.findSeparationControl({}, req);
      if (result?.length == 0) {
        return res
          .status(404)
          .send("SeparationControl not found in the database");
      }
      if(req.query.getReasons){
        if(req.query.getReasons.toLowerCase()=="true".toLowerCase())
          return res.status(200).send(result[0].miscellineous.resignationReasons);
      }
      if(req.query.getSetupBy){
        if(req.query.getSetupBy.toLowerCase()=="true".toLowerCase())
          return res.status(200).send(result[0].noticePeriodSetup.setupBy);
      }
      return res.status(200).send(result[0]);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  //create api
  createSeparationControl = async (req, res, next) => {
    try {
      console.log(
        "Create SeparationControl, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await SeparationControlService.createSeparationControl(
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
  updateSeparationControl = async (req, res, next) => {
    try {
      console.log(
        "Update SeparationControl, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await SeparationControlService.updateSeparationControl(
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

  //
  fetchNoticePeriordDetailsByEmployeeUUID = async (req, res, next) => {
    try {
      let result;
      const employeeUUID = req.params.employeeUUID;
      result =
        await SeparationControlService.fetchNoticePeriordDetailsByEmployeeUUID(
          employeeUUID,
          req
        );
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new SeparationControl();
