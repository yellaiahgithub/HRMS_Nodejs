const autoNumbering = require("../models/autoNumbering");
const AutoNumberingService = require("../services/autoNumberingService");

class AutoNumberingController {
  constructor() {}
  saveAutoNumberings = async (req, res, next) => {
    try {
      let autoNumberingData = req.body;
      if(autoNumberingData.action == 'CREATE') {
        await AutoNumberingService.createAutoNumberings(
          autoNumberingData, req, res
        );
      } else {
        let updateResp = await autoNumberingData.updateArray.forEach(
          async(temp) => {
            await AutoNumberingService.updateAutoNumbering(temp, req, res)
          }
        );
        // await AutoNumberingService.updateAutoNumbering(autoNumberingData, req, res)
      }

      let allAutoNumberings = await AutoNumberingService.getAllAutoNumberings(req, res);
      return res.status(200).send(allAutoNumberings);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  getAllAutoNumberings = async (req, res, next) => {
    try {
      let resp = await AutoNumberingService.getAllAutoNumberings(req, res);

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  getAutoNumberingByType = async (req, res, next) => {
    try {
      let autoNumberingData = req.body;
      let resp = await AutoNumberingService.getAutoNumberingByType(
        autoNumberingData, req, res
      );

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  getNextsequence = async (req, res, next) => {
    try {
      let resp = await AutoNumberingService.getNextSequence(
        req.body, req, res
      );

      return res.status(200).send(resp);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  updateAutoNumbering = async (req, res, next) => {
    try {
      let autoNumberingData = req.body;
      let resp = await AutoNumberingService.updateAutoNumbering(
        autoNumberingData, req, res
      );

      return res.status(200).send(resp);
    } catch (error) {
      // console.error(error);
      res.status(400).send(error.message);
    }
  };
}

module.exports = new AutoNumberingController();
