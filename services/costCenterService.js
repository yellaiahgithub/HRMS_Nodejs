const { v4: uuidv4 } = require('uuid');
const { switchDB, getDBModel, costCenterSchema } = require("../middlewares/switchDB");
class CostCenterService {
  constructor() { }

  createCostCenter = async (data, req, res) => {
    try {
      console.log("Data for costCenter create", data);
      data.id = uuidv4();
      const companyName = req.subdomain
      const DB = await switchDB(companyName, costCenterSchema)
      const costCenterModel = await getDBModel(DB, 'costCenter')
      return await costCenterModel.insertMany([data], {
        runValidators: true,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateCostCenter = async (data, req, res) => {
    try {
      console.log("Data for costCenter update", data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, costCenterSchema)
      const costCenterModel = await getDBModel(DB, 'costCenter')
      return await costCenterModel.findOneAndUpdate(
        { _id: data._id },
        { $set: data },
        { upsert: false }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain
      const DB = await switchDB(companyName, costCenterSchema)
      const costCenterModel = await getDBModel(DB, 'costCenter')
      return await costCenterModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findCostCenter = async (query, req, res) => {
    try {
      console.log("Get costCenter, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, costCenterSchema)
      const costCenterModel = await getDBModel(DB, 'costCenter')
      return await costCenterModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

}

module.exports = new CostCenterService();
