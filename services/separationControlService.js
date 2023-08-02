const {
  switchDB,
  getDBModel,
  separationControlSchema,
  employeeSchema,
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");
const separationControlUtils = require("../utils/separationControlUtils");

class SeparationControlService {
  constructor() {}

  createSeparationControl = async (data, req, res) => {
    try {
      console.log("Data for separationControl create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, separationControlSchema);
      const separationControlModel = await getDBModel(DB, "separationControl");
      const existingRecord = await separationControlModel.find({}).lean();
      if (existingRecord.length > 0)
        throw new Error(
          "Separation Control Record is already added. You can not create new Record. kindly update existing one"
        );
      data.uuid = uuidv4();
      let savedSeparationControl = await separationControlModel.insertMany(
        [data],
        { runValidators: true }
      );
      return savedSeparationControl;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateSeparationControl = async (data, req, res) => {
    try {
      console.log("Data for separationControl update", data);
      if (!data.uuid) throw new Error("UUID is required");
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, separationControlSchema);
      const separationControlModel = await getDBModel(DB, "separationControl");
      const savedSeparationControl = await separationControlModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false }
      );
      return await separationControlModel.findOne({ uuid: data.uuid }).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findSeparationControl = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, separationControlSchema);
      const separationControlModel = await getDBModel(DB, "separationControl");
      return await separationControlModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  fetchNoticePeriordDetailsByEmployeeUUID = async (employeeUUID, req) => {
    try {
      const companyName = req.subdomain;
      const separationDB = await switchDB(companyName, separationControlSchema);
      const separationControlModel = await getDBModel(
        separationDB,
        "separationControl"
      );
      const employeeDB = await switchDB(companyName, employeeSchema);
      const employeeModel = await getDBModel(employeeDB, "employee");
      const employee = await employeeModel
        .findOne({ uuid: employeeUUID })
        .lean();
      const sepetationCriteria = await separationControlModel
        .findOne({})
        .lean();
      const noticePeriod = await separationControlUtils.getNoticePeriod(
        employee,
        sepetationCriteria
      );
      // const noticePeriodValue=await separationControlUtils.getNoticePeriodValue(noticePeriod);
      let lastWorkingDay = null;
      if (noticePeriod) {
        lastWorkingDay = await separationControlUtils.getLastWorkingDate(
          noticePeriod
        );
      }
      const NoticePeriodDetails = {
        autoApproveByAdmin : sepetationCriteria.miscellineous.autoApproveByAdmin,
        autoApproveByManager : sepetationCriteria.miscellineous.autoApproveByManager,
        allowEarlyExit: sepetationCriteria.miscellineous.allowEarlyExit,
        allowEmployeeResignationDate : sepetationCriteria.miscellineous.allowEmployeeResignationDate,
        resignationReasons: sepetationCriteria.miscellineous.resignationReasons,
        noticePeriod: noticePeriod
          ? { value: noticePeriod.noticePeriod, unit: noticePeriod.unit }
          : null,
        lastWorkingDay: lastWorkingDay,
      };
      return NoticePeriodDetails;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new SeparationControlService();
