const { v4: uuidv4 } = require('uuid');
const { switchDB, getDBModel, leaveAccrualPolicySchema } = require("../middlewares/switchDB");
const leaveAccrualPolicyUtils = require('../utils/leaveAccrualPolicyUtils');
class LeaveAccrualPolicyService {
  constructor() { }

  createLeaveAccrualPolicy = async (data, req, res) => {
    try {
      console.log("Data for leaveAccrualPolicy create", data);
      leaveAccrualPolicyUtils.validateSavingData(data);
      data.uuid = uuidv4();
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccrualPolicySchema)
      const leaveAccrualPolicyModel = await getDBModel(DB, 'leaveAccrualPolicy')
      return await leaveAccrualPolicyModel.insertMany([data], {
        runValidators: true,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateLeaveAccrualPolicy = async (data, req, res) => {
    try {
      console.log("Data for leaveAccrualPolicy update", data);
      leaveAccrualPolicyUtils.validateSavingData(data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccrualPolicySchema)
      const leaveAccrualPolicyModel = await getDBModel(DB, 'leaveAccrualPolicy')
      return await leaveAccrualPolicyModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false,runValidators: true, }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccrualPolicySchema)
      const leaveAccrualPolicyModel = await getDBModel(DB, 'leaveAccrualPolicy')
      return await leaveAccrualPolicyModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findLeaveAccrualPolicy = async (query, req, res) => {
    try {
      console.log("Get leaveAccrualPolicy, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccrualPolicySchema)
      const leaveAccrualPolicyModel = await getDBModel(DB, 'leaveAccrualPolicy')
      return await leaveAccrualPolicyModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req, res) => {
    try {
      console.log("Get leaveAccrualPolicy, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveAccrualPolicySchema)
      const leaveAccrualPolicyModel = await getDBModel(DB, 'leaveAccrualPolicy')
      return await leaveAccrualPolicyModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

}

module.exports = new LeaveAccrualPolicyService();
