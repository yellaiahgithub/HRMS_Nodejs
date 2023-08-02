const {
  switchDB,
  getDBModel,
  orgChartSetupSchema,
} = require("../middlewares/switchDB");
const conf = require("../conf/conf");

class OrgChartSetupService {
  constructor() {}

  createOrgChartSetup = async (data, req, res) => {
    try {
      console.log("Data for orgChartSetup create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, orgChartSetupSchema);
      const orgChartSetupModel = await getDBModel(DB, "orgChartSetup");
      const savedOrgChartSetup = await orgChartSetupModel.insertMany([data], {
        runValidators: true,
      });
      return savedOrgChartSetup;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateOrgChartSetup = async (data, req, res) => {
    try {
      console.log("Data for orgChartSetup update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, orgChartSetupSchema);
      const orgChartSetupModel = await getDBModel(DB, "orgChartSetup");
      const opts = { upsert: false, runValidators: true };
      data.updatedAt = new Date();
      return await orgChartSetupModel.updateOne(
        { uuid: data.uuid },
        data,
        opts
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findOrgChartSetup = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, orgChartSetupSchema);
      const orgChartSetupModel = await getDBModel(DB, "orgChartSetup");
      return await orgChartSetupModel.findOne(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new OrgChartSetupService();
