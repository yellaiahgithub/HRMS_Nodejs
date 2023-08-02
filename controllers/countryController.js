const CountryService = require("../services/countryService");
const apiResponse = require("../helper/apiResponse");

class Country {
  constructor() {}

  findCountryByName = async (req, res, next) => {
    try {
      if (!req.params.name) throw new Error("Country name is required.");
      let query = { name: new RegExp(req.params.name, "i") };
      // call method to service
      let result = await CountryService.findCountry(query);

      if (!result) {
        return res.status(404).send("Country not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find Country, Data By: " + JSON.stringify(req.params));
      // call method to service
      let result = await CountryService.findAll();

      if (!result) {
        return res.status(404).send("Country not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createCountry = async (req, res, next) => {
    try {
      console.log("Create Country, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await CountryService.createCountry(data);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateCountry = async (req, res, next) => {
    try {
      console.log("Update Country, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await CountryService.updateCountry(data);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  deleteCountry = async (req, res) => {
    try {
      console.log("Delete Country, Data : " + JSON.stringify(req.query));

      const data = req.query;
      if (!data.name)
        return apiResponse.notFoundResponse(res, "Please send Country name");

      let query = {
        name: new RegExp(data.name,"i"),
      };

      // call method to service
      let response = await CountryService.delete(query);

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No Country found for the Name provided:${data.name}`
        );
      }
      return apiResponse.successResponse(res, "Successfully deleted Country");
    } catch (error) {
      console.log(error);
      apiResponse.errorResponse(res, error.message);
    }
  };
}

module.exports = new Country();
