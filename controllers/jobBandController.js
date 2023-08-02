const JobBandService = require("../services/jobBandService");

class JobBand {
  constructor() {}

  findJobBandById = async (req, res, next) => {
    try {
      if (!req.params.bandId) throw new Error("JobBand id is required.");
      let query = { bandId: req.params.bandId };
      // call method to service
      let result = await JobBandService.findJobBand(query, req);

      if (result?.length == 0) {
        return res.status(404).send("JobBand not found in the database");
      }
      return res.status(200).send(result[0]);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find JobBand, Data By: " + JSON.stringify(req.params));
      // call method to service
      let result = await JobBandService.findJobBand({}, req);

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAllLite = async (req, res, next) => {
    try {
      console.log("Find all JobBand, Data By: " + JSON.stringify(req.params));
      // call method to service
      let result = await JobBandService.findWihProjection({}, req);

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  
  createJobBand = async (req, res, next) => {
    try {
      console.log("Create JobBand, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await JobBandService.createJobBand(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateJobBand = async (req, res, next) => {
    try {
      console.log("Update JobBand, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await JobBandService.updateJobBand(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  
  searchJobBand = async (req, res, next) => {
    try {
      let result;
      if (!req.query.data) {
        result = await JobBandService.findJobBand({}, req);
      } else {
        result = await JobBandService.searchJobBand(
          req.query.data,
          req
        );
      }
      // call method to service

      if (!result) {
        return res.status(404).send("JobBand not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  generateCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Band_Id", key: "Band_Id" },
        { label: "Band_Name", key: "Band_Name" },
        { label: "Effective_Date(DD/MM/YYYY)", key: "Effective_Date(DD/MM/YYYY)" },
        { label: "Description", key: "Description" }
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

  createAllJobBands = async (req, res, next) => {
    try {
      let data = req.body;

      // call method to service
      let resp = await JobBandService.createAllJobBands(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new JobBand();
