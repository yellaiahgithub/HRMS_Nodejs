const {
    switchDB,
    getDBModel,
    holidayCalendarRestrictionsSchema
  } = require("../middlewares/switchDB");
  const { v4: uuidv4 } = require("uuid");
  
  class HolidayService {
    constructor() {}
  
    createHolidayCalendatRestrictions = async (data, req, res) => {
      try {
        console.log("Data for HolidayCalendatRestrictions create", data);
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, holidayCalendarRestrictionsSchema);
        const holidayCalendatRestrictionsModel = await getDBModel(DB, "holidayCalendatRestrictions");
        data.uuid = uuidv4();
        const savedHolidayCalendatRestriction = await holidayCalendatRestrictionsModel.insertMany([data], {
          runValidators: true,
        });
        return savedHolidayCalendatRestriction;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };
  
    findHolidayCalendatRestrictions = async (query, req) => {
      try {
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, holidayCalendarRestrictionsSchema);
        const holidayCalendatRestrictionsModel = await getDBModel(DB, "holidayCalendatRestrictions");
        return await holidayCalendatRestrictionsModel.findOne(query).lean();
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };

    updateHolidayCalendatRestrictions = async (data, req) => {
        try {
          console.log("Data for HolidayCalendatRestrictions update", data);
          const companyName = req.subdomain;
          const DB = await switchDB(companyName, holidayCalendarRestrictionsSchema);
          const holidayConfigModel = await getDBModel(DB, "holidayCalendatRestrictions");
          return await holidayConfigModel.findOneAndUpdate(
            { uuid: data.uuid },
            { $set: data },
            { upsert: false }
          ).lean();
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
    };
  }
  
  module.exports = new HolidayService();
  