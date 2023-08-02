const ItemCatalogueService = require("../services/itemCatalogueService");
const apiResponse = require("../helper/apiResponse");

class ItemCatalogue {
  constructor() {}

  findItemCatalogueById = async (req, res, next) => {
    try {
      if (!req.params.id) throw new Error("ItemCatalogue id is required.");
      let query = { _id: req.params.id };
      // call method to service
      let result = await ItemCatalogueService.findItemCatalogue(query, req);

      if (!result) {
        return res.status(404).send("ItemCatalogue not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  findItemCatalogueByType = async (req, res, next) => {
    try {
      if (!req.params.type) throw new Error("ItemCatalogue Type is required.");
      let query = { type: req.params.type };
      // call method to service
      let result = await ItemCatalogueService.findItemCatalogue(query, req);
      if (!result) {
        return res.status(404).send("ItemCatalogue not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  searchItemCatalogue = async (req, res, next) => {
    try {
      let result;
      if (!req.query.data) {
        result = await ItemCatalogueService.findAll(req, res);
      } else {
        result = await ItemCatalogueService.searchItemCatalogue(
          req.query.data,
          req
        );
      }
      // call method to service

      if (!result) {
        return res.status(404).send("ItemCatalogue not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find ItemCatalogue, Data By: " + JSON.stringify(req.params));
      // call method to service
      let result = await ItemCatalogueService.findAll(req, res);

      if (!result) {
        return res.status(404).send("ItemCatalogue not found in the database");
      }
      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  createItemCatalogue = async (req, res, next) => {
    try {
      console.log("Create ItemCatalogue, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await ItemCatalogueService.createItemCatalogue(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  createAllItemCatalogues = async (req, res, next) => {
    try {
      // console.log("Create ItemCatalogue, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await ItemCatalogueService.createAllItemCatalogues(
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
  updateItemCatalogue = async (req, res, next) => {
    try {
      console.log("Update ItemCatalogue, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await ItemCatalogueService.updateItemCatalogue(data, req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  deleteItemCatalogue = async (req, res) => {
    try {
      console.log("Delete ItemCatalogue, Data : " + JSON.stringify(req.query));

      const data = req.query;
      if (!data.code)
        return apiResponse.notFoundResponse(
          res,
          "Please send ItemCatalogue Code"
        );

      let query = {
        code: data.code,
      };

      // call method to service
      let response = await ItemCatalogueService.delete(query, req, res);

      if (response?.deletedCount == 0) {
        return apiResponse.validationErrorWithData(
          res,
          `No ItemCatalogue found for the Item Code provided:${data.code}`
        );
      }
      return apiResponse.successResponse(
        res,
        "Successfully deleted ItemCatalogue"
      );
    } catch (error) {
      console.log(error);
      apiResponse.errorResponse(res, error.message);
    }
  };
}

module.exports = new ItemCatalogue();
