const {
  switchDB,
  getDBModel,
  downloadResultsSchema,
} = require("../middlewares/switchDB");
var moment = require("moment");

class DownloadResultsService {
  constructor() {}

  create = async (data, req) => {
    try {
      console.log("Data for downloadResults create", data);
      const currrentDate = new Date();
      let month = "" + (currrentDate.getMonth() + 1),
        day = "" + currrentDate.getDate(),
        year = currrentDate.getFullYear();
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      const timeStamp = [
        month,
        day,
        year,
        currrentDate.getHours(),
        currrentDate.getMinutes(),
        currrentDate.getSeconds(),
      ].join("_");
      const DB = await switchDB(req.subdomain, downloadResultsSchema);
      const downloadResultsModel = await getDBModel(DB, "downloadResults");
      data["fileName"] = data.type + "_" + timeStamp+'.xlsx';
      data["createdAt"] = currrentDate;
      data["updatedAt"] = currrentDate;
      const savedDownloadResults = await downloadResultsModel.insertMany(
        [data],
        {
          runValidators: true,
        }
      );
      return savedDownloadResults;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  update = async (data, req) => {
    try {
      console.log("Data for downloadResults update", data);
      const DB = await switchDB(req.subdomain, downloadResultsSchema);
      const downloadResultsModel = await getDBModel(DB, "downloadResults");
      const opts = { upsert: false, runValidators: true };
      data["updatedAt"] = new Date();
      return await downloadResultsModel.updateOne(
        { uuid: data.uuid },
        data,
        opts
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  
  aggregate = async (pipeline, req) => {
    try {
      const DB = await switchDB(req.subdomain, downloadResultsSchema);
      const downloadResultsModel = await getDBModel(DB, "downloadResults");
      return await downloadResultsModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  delete = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, downloadResultsSchema);
      const downloadResultsModel = await getDBModel(DB, "downloadResults");
      // find and update record in mongoDB
      return await downloadResultsModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new DownloadResultsService();
