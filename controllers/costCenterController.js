const CostCenterService = require("../services/costCenterService");

class CostCenter {
  constructor() {}

  findCostCenterById = async (req, res, next) => {
    try {
      if (!req.params.id) throw new Error("CostCenter id is required.");
      let query = { id: req.params.id };
      // call method to service
      let result = await CostCenterService.findCostCenter(query, req, res);

      if (!result) {
        return res.status(404).send("CostCenter not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  findCostCenterByName = async (req, res, next) => {
    try {
      if (!req.params.name) throw new Error("CostCenter name is required.");
      let query = { name: new RegExp(req.params.name, "i") };
      // call method to service
      let result = await CostCenterService.findCostCenter(query, req, res);

      if (!result) {
        return res.status(404).send("CostCenter not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  findAll = async (req, res, next) => {
    try {
      console.log("Find CostCenter, Data By: " + JSON.stringify(req.params));
      // call method to service
      let result = await CostCenterService.findAll(req, res);

      if (!result) {
        return res.status(404).send("CostCenter not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createCostCenter = async (req, res, next) => {
    try {
      console.log("Create CostCenter, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await CostCenterService.createCostCenter(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateCostCenter = async (req, res, next) => {
    try {
      console.log("Update CostCenter, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await CostCenterService.updateCostCenter(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new CostCenter();
