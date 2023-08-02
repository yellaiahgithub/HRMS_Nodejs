const {
  switchDB,
  getDBModel,
  sourceBankSchema,
  bankSchema,
  bankBranchSchema,
} = require("../middlewares/switchDB");
const BankService = require("../services/bankService.js");
const BankBranchService = require("../services/bankBranchService.js");
const SourceBankUtils = require("../utils/sourceBankUtils");

class SourceBankService {
  constructor() {}

  createSourceBank = async (data, req, res) => {
    try {
      console.log("Data for sourceBank create", data);
      const DB = await switchDB(req.subdomain, sourceBankSchema);
      const sourceBankModel = await getDBModel(DB, "sourceBank");
      const existingSourceBank = await this.findSourceBank(
        {
          bankUUID: data.bankUUID,
          branchUUID: data.branchUUID,
        },
        req
      );
      if (existingSourceBank?.length > 0) {
        throw new Error("Source Branch all ready Exists");
      }
      const savedSourceBank = await sourceBankModel.insertMany([data], {
        runValidators: true,
      });
      return savedSourceBank;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateSourceBank = async (data, req, res) => {
    try {
      console.log("Data for sourceBank update", data);
      const DB = await switchDB(req.subdomain, sourceBankSchema);
      const sourceBankModel = await getDBModel(DB, "sourceBank");
      const existingSourceBank = await this.findSourceBank(
        {
          uuid: { $ne: data.uuid },
          bankUUID: data.bankUUID,
          branchUUID: data.branchUUID,
        },
        req
      );
      if (existingSourceBank?.length > 0) {
        throw new Error("Source Branch all ready added");
      }
      const opts = { upsert: false, runValidators: true };
      data.updatedAt = new Date();
      return await sourceBankModel.updateOne({ uuid: data.uuid }, data, opts);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const DB = await switchDB(req.subdomain, sourceBankSchema);
      const sourceBankModel = await getDBModel(DB, "sourceBank");
      return await sourceBankModel.find({}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  findAllSourceTargetBanks = async (req, res) => {
    try {
      const sourceTargetBanks = await this.findAll(req, res);
      const banksList = await BankService.findAll(req);
      const bankBranchList = await BankBranchService.findAll(req);
      const requiredList = await SourceBankUtils.transformSourceTargetBank(
        sourceTargetBanks,
        banksList,
        bankBranchList
      );
      return requiredList;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  findSourceBank = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, sourceBankSchema);
      const sourceBankModel = await getDBModel(DB, "sourceBank");
      return await sourceBankModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  searchSourceBank = async (data, req) => {
    try {
      const DB = await switchDB(req.subdomain, sourceBankSchema);
      const sourceBankModel = await getDBModel(DB, "sourceBank");
      const searchresults = [];
      //TO DO SERVICE CALLS
      return searchresults;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  delete = async (query, req, res) => {
    try {
      const DB = await switchDB(req.subdomain, sourceBankSchema);
      const sourceBankModel = await getDBModel(DB, "sourceBank");
      // find and update record in mongoDB
      return await sourceBankModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new SourceBankService();
