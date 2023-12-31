const {
  switchDB,
  getDBModel,
  designationSchemas,
  uploadResultsSchema,
} = require("../middlewares/switchDB");
const autoNumberingService = require("../services/autoNumberingService");
const designationUtils = require("../utils/designationUtils");
var moment = require("moment"); // require

class DesignationService {
  constructor() {}

  createDesignation = async (data, req, res) => {
    try {
      console.log("Data for designation create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, designationSchemas);
      const designationModel = await getDBModel(DB, "designation");
      const nextSequence = await autoNumberingService.getNextSequence(
        { type: "DES", req, res },
        req
      );
      if (nextSequence != null) {
        data.id = nextSequence;
      }
      const savedDesignation = await designationModel.insertMany([data], {
        runValidators: true,
      });
      if (nextSequence != null) {
        const temp = await autoNumberingService.updateSequence(
          { type: "DES" },
          req,
          res
        );
      }
      return savedDesignation;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  updateDesignation = async (data, req, res) => {
    try {
      console.log("Data for designation update", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, designationSchemas);
      const designationModel = await getDBModel(DB, "designation");
      return await designationModel.updateOne(
        { _id: data._id },
        { $set: data },
        { upsert: true }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req, res) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, designationSchemas);
      const designationModel = await getDBModel(DB, "designation");
      return await designationModel.find({});
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findDesignation = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, designationSchemas);
      const designationModel = await getDBModel(DB, "designation");
      return await designationModel.findOne(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  findAllDesignationsByCondition = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, designationSchemas);
      const designationModel = await getDBModel(DB, "designation");
      return await designationModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findWithProjection = async (query, req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, designationSchemas);
      const designationModel = await getDBModel(DB, "designation");
      return await designationModel.find(query, {_id:0, id:1, name:1,}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
  createAllDesignations = async (data, req, res) => {
    try {
      let errorList = [];
      let errorCount = 0;
      let sucessList = [];
      let sucessfullyAddedCount = 0;
      const allDesignations = await this.findAll(req, res);

      const DesignationDB = await switchDB(req.subdomain, designationSchemas);
      const uploadResultsDB = await switchDB(
        req.subdomain,
        uploadResultsSchema
      );
      const designationModel = await getDBModel(DesignationDB, "designation");
      const uploadResultsModel = await getDBModel(
        uploadResultsDB,
        "uploadResults"
      );
      let CSVHeader = [];
      if (!data?.isAutoGeneratedDesignationId) {
        CSVHeader.push({ label: "Designation_Id", key: "id" });
      }
      CSVHeader.push(
        { label: "Designation_Name", key: "name" },
        { label: "Job_Grade", key: "jobGrade" },
        { label: "Job_Level", key: "jobLevel" },
        { label: "Is_One_To_One", key: "isOneToOne" },
        { label: "Is_Critical", key: "isCritical" },
        { label: "As_Of_Date(DD/MM/YYYY)", key: "asOfDate" }
      );
      let uploadingData = {
        type: "Designation",
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
        const designation = data.data[i];

        console.log("processing the record: ", i + 1);
        const errors = await designationUtils.validateDesignation(
          designation,
          data.data,
          data?.isAutoGeneratedDesignationId,
          allDesignations,
          i
        );
        if (errors.length > 0) {
          const errorData = { ...designation };
          errorData.errors = errors;
          errorList.push(errorData);
          errorCount++;
        } else {
          try {
            const designationData = {
              ...designation,
              status: true,
            };
            designationData.isCritical =
              designation.isCritical?.toLowerCase() === "true".toLowerCase();
            designationData.isOneToOne =
              designation.isOneToOne?.toLowerCase() === "true".toLowerCase();
            designationData["asOfDate"] = new Date(
              moment(designation.asOfDate, "DD/MM/YYYY")
            );
            if (data?.isAutoGeneratedDesignationId) {
              const nextSequence = await autoNumberingService.getNextSequence(
                { type: "DES" },
                req,
                res
              );
              if (nextSequence != null) {
                designationData.id = nextSequence;
              }
            }
            const savedDesignation = await designationModel.insertMany(
              [designationData],
              { runValidators: true }
            );
            if (savedDesignation.length > 0) {
              if (data?.isAutoGeneratedDesignationId) {
                const temp = await autoNumberingService.updateSequence(
                  { type: "DES" },
                  req,
                  res
                );
              }
              sucessList.push(designationData);
              sucessfullyAddedCount++;
            }
          } catch (error) {
            const errorData = { ...designation };
            errorData.errors = error.errors?.code?.properties?.message;
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

module.exports = new DesignationService();
