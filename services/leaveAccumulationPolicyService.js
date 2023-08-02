const { v4: uuidv4 } = require('uuid');
const { switchDB, getDBModel, leaveAccumulationPolicySchema } = require("../middlewares/switchDB");
const leaveAccumulationPolicyUtils = require('../utils/leaveAccumulationPolicyUtils');
class LeaveAccumulationPolicyService {
  constructor() { }

  createLeaveAccumulationPolicy = async (data, req, res) => {
    try {
      console.log("Data for leaveAccumulationPolicy create", data);
      leaveAccumulationPolicyUtils.validateSavingData(data);
      data.uuid = uuidv4();
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccumulationPolicySchema)
      const leaveAccumulationPolicyModel = await getDBModel(DB, 'leaveAccumulationPolicy')
      return await leaveAccumulationPolicyModel.insertMany([data], {
        runValidators: true,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateLeaveAccumulationPolicy = async (data, req, res) => {
    try {
      console.log("Data for leaveAccumulationPolicy update", data);
      leaveAccumulationPolicyUtils.validateSavingData(data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccumulationPolicySchema)
      const leaveAccumulationPolicyModel = await getDBModel(DB, 'leaveAccumulationPolicy')
      return await leaveAccumulationPolicyModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false, runValidators: true,}
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccumulationPolicySchema)
      const leaveAccumulationPolicyModel = await getDBModel(DB, 'leaveAccumulationPolicy')
      return await leaveAccumulationPolicyModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findLeaveAccumulationPolicy = async (query, req, res) => {
    try {
      console.log("Get leaveAccumulationPolicy, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccumulationPolicySchema)
      const leaveAccumulationPolicyModel = await getDBModel(DB, 'leaveAccumulationPolicy')
      return await leaveAccumulationPolicyModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req, res) => {
    try {
      console.log("Get leaveAccumulationPolicy, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccumulationPolicySchema)
      const leaveAccumulationPolicyModel = await getDBModel(DB, 'leaveAccumulationPolicy')
      return await leaveAccumulationPolicyModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

}

module.exports = new LeaveAccumulationPolicyService();
