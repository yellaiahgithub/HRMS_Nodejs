const UploadResultsService = require("../services/uploadResultsService");
const apiResponse = require("../helper/apiResponse");

class UploadResults {
  constructor() {}

  findAll = async (req, res, next) => {
    try {
      let result;
      if (!req.query.data) {
        result = await UploadResultsService.findAll(req, res);
      } else {
        console.log(
          "Find UploadResults, Data By: " + JSON.stringify(req.params)
        );
        result = await UploadResultsService.search(req.query.data, req);
      }
      if (!result) {
        return res.status(404).send("UploadResults not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new UploadResults();
