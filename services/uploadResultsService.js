const {
  switchDB,
  getDBModel,
  uploadResultsSchema,
} = require("../middlewares/switchDB");
var moment = require("moment");

class UploadResultsService {
  constructor() {}

  createUploadResults = async (data, req, res) => {
    try {
      console.log("Data for uploadResults create", data);
      const DB = await switchDB(req.subdomain, uploadResultsSchema);
      const uploadResultsModel = await getDBModel(DB, "uploadResults");
      const savedUploadResults = await uploadResultsModel.insertMany([data], {
        runValidators: true,
      });
      return savedUploadResults;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateUploadResults = async (data, req, res) => {
    try {
      console.log("Data for uploadResults update", data);
      const DB = await switchDB(req.subdomain, uploadResultsSchema);
      const uploadResultsModel = await getDBModel(DB, "uploadResults");
      const opts = { upsert: false, runValidators: true };
      const updatedData = {
        type: data.type,
        fileName: data.code,
        data: data.designation,
        status: data.status,
        effectiveDate: data.effectiveDate,
        createdAt: data.createdAt,
        updatedAt: new Date(),
      };
      return await uploadResultsModel.updateOne(
        { _id: data._id },
        updatedData,
        opts
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const DB = await switchDB(req.subdomain, uploadResultsSchema);
      const uploadResultsModel = await getDBModel(DB, "uploadResults");
      const results = await uploadResultsModel.find({}).lean();
      results.sort((a, b) => b.createdAt - a.createdAt);
      return results;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findUploadResults = async (query, req) => {
    try {
      const DB = await switchDB(req.subdomain, uploadResultsSchema);
      const uploadResultsModel = await getDBModel(DB, "uploadResults");
      return await uploadResultsModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  delete = async (query, req, res) => {
    try {
      const DB = await switchDB(req.subdomain, uploadResultsSchema);
      const uploadResultsModel = await getDBModel(DB, "uploadResults");
      // find and update record in mongoDB
      return await uploadResultsModel.deleteOne(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  search = async (data, req) => {
    try {
      const DB = await switchDB(req.subdomain, uploadResultsSchema);
      const uploadResultsModel = await getDBModel(DB, "uploadResults");
      const searchresults = [];
      const typeQuery = { type: new RegExp(data, "i") };
      const typeSearch = await uploadResultsModel.find(typeQuery).lean();
      if (typeSearch && typeSearch.length > 0) {
        typeSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const uploadedByQuery = { uploadedBy: new RegExp(data, "i") };
      const uploadedBySearch = await uploadResultsModel
        .find(uploadedByQuery)
        .lean();
      if (uploadedBySearch && uploadedBySearch.length > 0) {
        uploadedBySearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const fileNameQuery = {
        fileName: new RegExp(data, "i"),
      };
      const fileNameSearch = await uploadResultsModel
        .find(fileNameQuery)
        .lean();
      if (fileNameSearch && fileNameSearch.length > 0) {
        fileNameSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const statusQuery = { status: new RegExp(data, "i") };
      const statusSearch = await uploadResultsModel.find(statusQuery).lean();
      if (statusSearch && statusSearch.length > 0) {
        statusSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      if (data.length === 10 && moment(data, "DD/MM/YYYY").isValid()) {
        const currentDate = new Date(moment(data, "DD/MM/YYYY"));
        const nextDate = new Date(moment(data, "DD/MM/YYYY"));
        nextDate.setDate(currentDate.getDate() + 1);
        let uploadedDateQuery = {
          createdAt: {
            $gte: currentDate,
            $lt: nextDate,
          },
        };
        const uploadedDateSearch = await uploadResultsModel
          .find(uploadedDateQuery)
          .lean();
        if (uploadedDateSearch && uploadedDateSearch.length > 0) {
          uploadedDateSearch.forEach((result) => {
            searchresults.push(result);
          });
        }
      }
      searchresults.sort((a, b) => b.createdAt - a.createdAt);
      return searchresults;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new UploadResultsService();
