const HolidayService = require("../services/HolidayService");

class Holiday {
  constructor() {}

  createHoliday = async (req, res, next) => {
    try {
      console.log("Create Holiday, Data By: " + JSON.stringify(req.body));
      let data = req.body;

      // call method to service
      let resp = await HolidayService.createHoliday(data, req, res);
      let allHolidays = resp
      if(resp?.length>0) {
        allHolidays = await HolidayService.findHoliday({}, req);
      }
      return res.status(200).send(allHolidays);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  findAll = async (req, res, next) => {
    try {
      console.log("Find Holiday, Data By: " + JSON.stringify(req.params));
      // call method to service
      let result = await HolidayService.findHoliday({}, req);

      return res.status(200).send(result);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };

  
}

module.exports = new Holiday();
