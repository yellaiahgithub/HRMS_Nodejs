const {
  switchDB,
  getDBModel,
  letterTemplateSchema,
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");

class LetterTemplateService {
  constructor() {}

  createLetterTemplate = async (data, req, res) => {
    try {
      console.log("Data for letterTemplate create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, letterTemplateSchema);
      const letterTemplateModel = await getDBModel(DB, "letterTemplate");
      data.uuid = uuidv4();
      let savedLetterTemplate = await letterTemplateModel.insertMany([data], {runValidators: true});
      return savedLetterTemplate;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateLetterTemplate = async (data, req, res) => {
    try {
      console.log("Data for letterTemplate update", data);
      if (!data.uuid) throw new Error("UUID is required");
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, letterTemplateSchema);
      const letterTemplateModel = await getDBModel(DB, "letterTemplate");
      const savedLetterTemplate = await letterTemplateModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false }
      );
      return savedLetterTemplate;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findLetterTemplate = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, letterTemplateSchema);
      const letterTemplateModel = await getDBModel(DB, "letterTemplate");
      return await letterTemplateModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  deleteLetterTemplate = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, letterTemplateSchema);
      const letterTemplateModel = await getDBModel(DB, "letterTemplate");
      // find and update record in mongoDB
      return await letterTemplateModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new LetterTemplateService();
