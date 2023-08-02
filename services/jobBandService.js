const {
  switchDB,
  getDBModel,
  jobBandSchema,
  uploadResultsSchema
} = require("../middlewares/switchDB");
const { v4: uuidv4 } = require("uuid");
const jobBandUtils = require("../utils/jobBandUtils");
var moment = require("moment"); // require

class JobBandService {
  constructor() {}

  createJobBand = async (data, req, res) => {
    try {
      console.log("Data for jobBand create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, jobBandSchema);
      const jobBandModel = await getDBModel(DB, "jobBand");
      data.uuid = uuidv4();
      const errors = await jobBandUtils.validateJobBand(data);
      const existingJobBand = await jobBandModel
        .findOne({ bandId: data.bandId })
        .lean();
      if (existingJobBand) {
        errors.push(
          "BandId '" +
            existingJobBand.bandId +
            "' already assigned to another band with name '" +
            existingJobBand.bandName +
            "'."
        );
      }
      if (errors.length > 0) {
        const errorData = { ...data };
        errorData.errors = errors;
        return errorData;
      } else {
        let savedJobBand;
        try {
          savedJobBand = await jobBandModel.insertMany([data], {
            runValidators: true,
          });
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
        return savedJobBand;
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateJobBand = async (data, req, res) => {
    try {
      console.log("Data for jobBand update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, jobBandSchema);
      const jobBandModel = await getDBModel(DB, "jobBand");
      if (!data.uuid) data.uuid = uuidv4();
      const savedJobBand = await jobBandModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: true }
      );
      return savedJobBand;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findJobBand = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, jobBandSchema);
      const jobBandModel = await getDBModel(DB, "jobBand");
      return await jobBandModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  
  findWihProjection = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, jobBandSchema);
      const jobBandModel = await getDBModel(DB, "jobBand");
      return await jobBandModel.find(query, {_id:0, uuid:1, bandId:1, bandName:1 }).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  searchJobBand = async (data, req) => {
    try {
      const DB = await switchDB(req.subdomain, jobBandSchema);
      const jobBandModel = await getDBModel(DB, "jobBand");
      const searchresults = [];
      const bandIdQuery = { bandId: new RegExp(data, "i") };
      const bandIdSearch = await jobBandModel.find(bandIdQuery).lean();
      if (bandIdSearch && bandIdSearch.length > 0) {
        bandIdSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const bandNameQuery = { bandName: new RegExp(data, "i") };
      const bandNameSearch = await jobBandModel.find(bandNameQuery).lean();
      if (bandNameSearch && bandNameSearch.length > 0) {
        bandNameSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      const descriptionQuery = {
        description: new RegExp(data, "i"),
      };
      const descriptionSearch = await jobBandModel
        .find(descriptionQuery)
        .lean();
      if (descriptionSearch && descriptionSearch.length > 0) {
        descriptionSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      let statusQuery = { status: null };
      if (new RegExp(data, "i").test("active")) {
        statusQuery = { status: true };
      } else if (new RegExp(data, "i").test("inactive")) {
        statusQuery = { status: false };
      }
      const statusSearch = await jobBandModel.find(statusQuery).lean();
      if (statusSearch && statusSearch.length > 0) {
        statusSearch.forEach((result) => {
          searchresults.push(result);
        });
      }
      return searchresults;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  createAllJobBands = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const allJobBands = await this.findJobBand({}, req);

      const JobBandDB = await switchDB(req.subdomain, jobBandSchema);
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const jobBandModel = await getDBModel(JobBandDB, "jobBand");
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Band_Id", key: "bandId" },
        { label: "Band_Name", key: "bandName" },
        { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate" },
        { label: "Description", key: "description" }
      );
      let uploadingData = {
        type: "JobBand",
        uploadedBy: "namya",
        fileName: data.fileName,
        errorFileName: data.fileName,
        status: "InProgress",
        uploadedData: data.data,
        createdAt: new Date(),
        csvHeader: CSVHeader,
      };
      const createUploadResult = await uploadResultsModel.insertMany(
        [uploadingData],
        {
          runValidators: true,
        }
      );
      for (let i = 0; i < data.data?.length > 0; i++) {
        const jobBand = data.data[i];

        console.log("processing the record: ", i + 1);
        const errors = await jobBandUtils.validateUploadedJobBand(
          jobBand,
          data.data,
          allJobBands,
          i
        );
        if (errors.length > 0) {
          const errorData = { ...jobBand };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            const jobBandData = {
              ...jobBand,
              status: true,
            };
            jobBandData["effectiveDate"] = new Date(
              moment(jobBand.effectiveDate, "DD/MM/YYYY")
            );
            const savedJobBand = await jobBandModel.insertMany([jobBandData], {
              runValidators: true,
            });
            if (savedJobBand.length > 0) {
              sucessList.push(jobBandData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...jobBand };
            errorData.errors = error?.message;
            errorList.push(errorData);
            errorCount++;
            console.log("error occured while saving record", i + 1);
            console.log("err", error);
          }
        }
        console.log("processed record", i + 1);
      }
      const updateUploadResult = await uploadResultsModel.updateOne(
        { _id: createUploadResult[0]._id },
        {
          $set: {
            status:
              sucessfullyAddedCount == data.data.length ? "Sucess" : "Rejected",
            errorData: errorList,
            updatedAt: new Date(),
          },
        },
        { upsert: false, runValidators: true }
      );
      console.log();
      return {
        totalRecords: data.data.length,
        sucessfullyAdded: sucessfullyAddedCount,
        errorCount: errorCount,
        errorData: errorList,
        sucessData: sucessList,
        data: data.data,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new JobBandService();
