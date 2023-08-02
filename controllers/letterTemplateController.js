const LetterTemplateService = require("../services/letterTemplateService");

class LetterTemplate {
  constructor() {}

  //findbyuuid api and findAll api
  find = async (req, res, next) => {
    try {
      let result;
      let query = {};
      if (req.query.uuid) {
        query = { uuid: req.query.uuid };
      }
      result = await LetterTemplateService.findLetterTemplate(query, req);
      if (result?.length == 0) {
        return res.status(404).send("LetterTemplate not found in the database");
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
  createLetterTemplate = async (req, res, next) => {
    try {
      console.log(
        "Create LetterTemplate, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await LetterTemplateService.createLetterTemplate(
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
  updateLetterTemplate = async (req, res, next) => {
    try {
      console.log(
        "Update LetterTemplate, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp = await LetterTemplateService.updateLetterTemplate(
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

  //delete api
  deleteLetterTemplate = async (req, res, next) => {
    try {
      if (!req.params.uuid)
        throw new Error("Letter Template UUID is required.");
      let query = { uuid: req.params.uuid };
      // call method to service
      let resp = await LetterTemplateService.deleteLetterTemplate(query, req);
      if (resp?.deletedCount == 0) {
        return res
          .status(200)
          .send(`No letterTemplate found for the UUID provided:${query.uuid}`);
      }
      return res.status(200).send("Successfully deleted letterTemplate");
      // return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new LetterTemplate();
