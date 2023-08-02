const { v4: uuidv4 } = require('uuid');
const { switchDB, getDBModel, leaveControlsSchema } = require("../middlewares/switchDB");
const leaveControlsUtils = require('../utils/leaveControlsUtils');
class LeaveControlsService {
  constructor() { }

  createLeaveControls = async (data, req, res) => {
    try {
      console.log("Data for leaveControls create", data);
      data.uuid = uuidv4();
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveControlsSchema)
      const leaveControlsModel = await getDBModel(DB, 'leaveControls')
      const existingLeaveControl=await leaveControlsModel.findOne().lean();
      if(existingLeaveControl) throw new Error("Leave Control Record is already added. You can not create new Record. kindly update existing one.")
      leaveControlsUtils.validateSavingData(data);
      return await leaveControlsModel.insertMany([data], {
        runValidators: true,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateLeaveControls = async (data, req, res) => {
    try {
      console.log("Data for leaveControls update", data);
      leaveControlsUtils.validateSavingData(data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveControlsSchema)
      const leaveControlsModel = await getDBModel(DB, 'leaveControls')
      return await leaveControlsModel.updateOne(
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
      const DB = await switchDB(companyName, leaveControlsSchema)
      const leaveControlsModel = await getDBModel(DB, 'leaveControls')
      return await leaveControlsModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findLeaveControls = async (query, req, res) => {
    try {
      console.log("Get leaveControls, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, leaveControlsSchema)
      const leaveControlsModel = await getDBModel(DB, 'leaveControls')
      return await leaveControlsModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

}

module.exports = new LeaveControlsService();
