const {
  switchDB,
  getDBModel,
  letterTemplateVariablesSchema,
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");
const conf = require('../conf/conf')

class LetterTemplateVariablesService {
  constructor() {}

  createLetterTemplateVariables = async (data, req, res) => {
    try {
      console.log("Data for letterTemplateVariables create", data);
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, letterTemplateVariablesSchema);
      const letterTemplateVariablesModel = await getDBModel(
        DB,
        "letterTemplateVariables"
      );
      data.uuid = uuidv4();
      let savedLetterTemplateVariables =
        await letterTemplateVariablesModel.insertMany([data], {
          runValidators: true,
        });
      return savedLetterTemplateVariables;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateLetterTemplateVariables = async (data, req, res) => {
    try {
      console.log("Data for letterTemplateVariables update", data);
      if (!data.uuid) throw new Error("UUID is required");
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, letterTemplateVariablesSchema);
      const letterTemplateVariablesModel = await getDBModel(
        DB,
        "letterTemplateVariables"
      );
      const savedLetterTemplateVariables =
        await letterTemplateVariablesModel.updateOne(
          { uuid: data.uuid },
          { $set: data },
          { upsert: false }
        );
      return savedLetterTemplateVariables;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findLetterTemplateVariables = async (query, req) => {
    try {
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, letterTemplateVariablesSchema);
      const letterTemplateVariablesModel = await getDBModel(
        DB,
        "letterTemplateVariables"
      );
      return await letterTemplateVariablesModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  deleteLetterTemplateVariables = async (query, req) => {
    try {
      const companyName = conf.DB_NAME;
      const DB = await switchDB(companyName, letterTemplateVariablesSchema);
      const letterTemplateVariablesModel = await getDBModel(
        DB,
        "letterTemplateVariables"
      );
      // find and update record in mongoDB
      return await letterTemplateVariablesModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new LetterTemplateVariablesService();
