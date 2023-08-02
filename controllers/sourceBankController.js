const SourceBankService = require("../services/sourceBankService");
const apiResponse = require("../helper/apiResponse");

class SourceBank {
  constructor() {}

  findSourceBankByUUID = async (req, res, next) => {
    try {
      if (!req.params.uuid) throw new Error("SourceBank id is required.");
      let query = { uuid: req.params.uuid };
      // call method to service
      let result = await SourceBankService.findSourceBank(query, req);

      if (!result) {
        return res.status(404).send("SourceBank not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  searchSourceBank = async (req, res, next) => {
    try {
      let result;
      if (!req.query.data) {
        result = await SourceBankService.findAll(req, res);
      } else {
        // result = await SourceBankService.searchSourceBank(req.query.data, req);
      }
      // call method to service

      if (!result) {
        return res.status(404).send("SourceBank not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find SourceBank, Data By: " + JSON.stringify(req.params));
      // call method to service

      let result = await SourceBankService.findAll(req, res);
      if (!result) {
        return res.status(404).send("SourceBank not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAllSourceTargetBanks = async (req, res, next) => {
    try {
      let result = await SourceBankService.findAllSourceTargetBanks(req, res);
      if (!result) {
        return res.status(404).send("SourceBanks not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  createSourceBank = async (req, res, next) => {
    try {
      console.log("Create SourceBank, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await SourceBankService.createSourceBank(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  updateSourceBank = async (req, res, next) => {
    try {
      console.log("Update SourceBank, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await SourceBankService.updateSourceBank(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  deleteSourceBank = async (req, res) => {
    try {
      console.log("Delete SourceBank, Data : " + JSON.stringify(req.query));

      const data = req.query;
      if (!data.uuid)
        return apiResponse.notFoundResponse(res, "Please send SourceBank UUID");

      let query = {
        uuid: data.uuid,
      };

      // call method to service
      let response = await SourceBankService.delete(query, req, res);

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No SourceBank found for the UUId provided:${data.uuid}`
        );
      }
      return apiResponse.successResponse(
        res,
        "Successfully deleted SourceBank"
      );
    } catch (error) {
      console.log(error);
      apiResponse.errorResponse(res, error.message);
    }
  };
}

module.exports = new SourceBank();
