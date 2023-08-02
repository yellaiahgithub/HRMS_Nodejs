const {
  switchDB,
  getDBModel,
  transactionSummarySchema,
} = require("../middlewares/switchDB");

class TransactionSummaryService {
  constructor() {}

  createTransactionSummary = async (data, req) => {
    try {
      console.log("Data for transactionSummary create", data);
      const DB = await switchDB(req.subdomain, transactionSummarySchema);
      const transactionSummaryModel = await getDBModel(DB, "transactionSummary");
      const savedTransactionSummary = await transactionSummaryModel.insertMany([data], {
        runValidators: true,
      });
      return savedTransactionSummary;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateTransactionSummary = async (data, req) => {
    try {
      console.log("Data for transactionSummary update", data);
      const DB = await switchDB(req.subdomain, transactionSummarySchema);
      const transactionSummaryModel = await getDBModel(DB, "transactionSummary");
      const opts = { upsert: false, runValidators: true };
      data.updatedAt = new Date();
      return await transactionSummaryModel.updateOne({ requestUUID: data.requestUUID, employeeUUID:data.employeeUUID  }, data, opts);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findTransactionSummary = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, transactionSummarySchema);
      const transactionSummaryModel = await getDBModel(DB, "transactionSummary");
      return await transactionSummaryModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  delete = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, transactionSummarySchema);
      const transactionSummaryModel = await getDBModel(DB, "transactionSummary");
      // find and update record in mongoDB
      return await transactionSummaryModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  findTransactionSummaryByAggregation = async (pipeline, req) => {
    try {
      const DB = await switchDB(req.subdomain, transactionSummarySchema);
      const transactionSummaryModel = await getDBModel(DB, "transactionSummary");
      return await transactionSummaryModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

}

module.exports = new TransactionSummaryService();
