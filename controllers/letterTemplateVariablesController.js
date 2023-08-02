const LetterTemplateVariablesService = require("../services/letterTemplateVariablesService");

class LetterTemplateVariables {
  constructor() {}

  //findbyuuid api and findAll api
  find = async (req, res, next) => {
    try {
      let result;
      let query = {};
      if (req.query.uuid) {
        query = { uuid: req.query.uuid };
      }
      if (req.query.templateType) {
        query = { templateType: req.query.templateType,status:true };
      }
      result = await LetterTemplateVariablesService.findLetterTemplateVariables(
        query,
        req
      );
      if (result?.length == 0) {
        return res
          .status(404)
          .send("LetterTemplateVariables not found in the database");
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
  createLetterTemplateVariables = async (req, res, next) => {
    try {
      console.log(
        "Create LetterTemplateVariables, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp =
        await LetterTemplateVariablesService.createLetterTemplateVariables(
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
  updateLetterTemplateVariables = async (req, res, next) => {
    try {
      console.log(
        "Update LetterTemplateVariables, Data By: " + JSON.stringify(req.body)
      );
      let data = req.body;

      // call method to service
      let resp =
        await LetterTemplateVariablesService.updateLetterTemplateVariables(
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
  deleteLetterTemplateVariables = async (req, res, next) => {
    try {
      if (!req.params.uuid)
        throw new Error("Letter Template UUID is required.");
      let query = { uuid: req.params.uuid };
      // call method to service
      let resp =
        await LetterTemplateVariablesService.deleteLetterTemplateVariables(
          query,
          req
        );
      if (resp?.deletedCount == 0) {
        return res
          .status(200)
          .send(
            `No letterTemplateVariables found for the UUID provided:${query.uuid}`
          );
      }
      return res
        .status(200)
        .send("Successfully deleted letterTemplateVariables");
      // return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new LetterTemplateVariables();
