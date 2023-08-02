const {
  switchDB,
  getDBModel,
  countrySchema,
} = require("../middlewares/switchDB");
const conf = require('../conf/conf')

class CountryService {
  constructor() {}

  createCountry = async (data) => {
    try {
      console.log("Data for country create", data);
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, countrySchema);
      const countryModel = await getDBModel(DB, "country");
      data.createdAt = new Date();
      data.updatedAt = new Date();
      const existingCountry = await this.findCountry(
        {
          name: new RegExp(data.name, "i"),
        }
      );
      if (existingCountry.length > 0)
        throw new Error("Country with name " + data.name + " already Exists");
      const savedCountry = await countryModel.insertMany([data], {
        runValidators: true,
      });
      return savedCountry;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateCountry = async (data) => {
    try {
      console.log("Data for country update", data);
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, countrySchema);
      const countryModel = await getDBModel(DB, "country");
      const opts = { upsert: false, runValidators: true };
      const updatedData = {
        uuid: data.uuid,
        name: data.name,
        states: data.states,
        createdAt: data.createdAt,
        updatedAt: new Date(),
      };
      const existingCountry = await this.findCountry(
        {
          name: new RegExp(data.name, "i"),
        }
      );
      if (existingCountry.length > 0 && existingCountry[0].uuid != data.uuid)
        throw new Error("Country with name " + data.name + " already Exists");
      return await countryModel.updateOne(
        { uuid: data.uuid },
        updatedData,
        opts
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async () => {
    try {
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, countrySchema);
      const countryModel = await getDBModel(DB, "country");
      return await countryModel.find({}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findCountry = async (query) => {
    try {
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, countrySchema);
      const countryModel = await getDBModel(DB, "country");
      return await countryModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  delete = async (query) => {
    try {
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, countrySchema);
      const countryModel = await getDBModel(DB, "country");
      // find and update record in mongoDB
      return await countryModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new CountryService();
