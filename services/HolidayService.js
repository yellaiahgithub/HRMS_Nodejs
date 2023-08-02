const {
  switchDB,
  getDBModel,
  holidaySchema
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");

class HolidayService {
  constructor() {}

  createHoliday = async (data, req, res) => {
    try {
      console.log("Data for holiday create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, holidaySchema);
      const holidayModel = await getDBModel(DB, "holiday");
      data.uuid = uuidv4();
      const savedHoliday = await holidayModel.insertMany([data], {
        runValidators: true,
      });
      return savedHoliday;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findHoliday = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, holidaySchema);
      const holidayModel = await getDBModel(DB, "holiday");
      return await holidayModel.find(query).collation({locale: "en" }).sort({ name:1}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new HolidayService();
