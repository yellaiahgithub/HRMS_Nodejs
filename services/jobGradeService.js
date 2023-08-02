const {
    switchDB,
    getDBModel,
    jobGradeSchema,
    uploadResultsSchema,
  } = require("../middlewares/switchDB");
  const { v4: uuidv4 } = require("uuid");
  const jobGradeUtils = require("../utils/jobGradeUtils.js");
  var moment = require("moment"); // require

  class JobGradeService {
    constructor() {}
  
    createJobGrade = async (data, req, res) => {
      try {
        console.log("Data for jobGrade create", data);
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, jobGradeSchema);
        const jobGradeModel = await getDBModel(DB, "jobGrade");

        const allJobGrades = await this.findJobGrade({},req);
        data.uuid = uuidv4();
        const errors = await jobGradeUtils.validateJobGrade(data, allJobGrades);
        
        const existingJobGrade = allJobGrades?.find(j => (j?.gradeId == data?.gradeId) && j?.status)

        if (existingJobGrade) {
          errors.push(
            "GradeId '" +
              existingJobGrade.gradeId +
              "' already assigned to another grade with name '" +
              existingJobGrade.gradeName +
              "'."
          );
        }
        if (errors.length > 0) {
          const errorData = { ...data };
          errorData.errors = errors;
          return errorData;
        } else {
          let savedJobGrade;
          try {
            savedJobGrade = await jobGradeModel.insertMany([data], {
              runValidators: true,
            });
          } catch (error) {
            console.log(error);
            throw new Error(error);
          }
          return savedJobGrade;
        }
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };
  
    updateJobGrade = async (data, req, res) => {
      try {
        console.log("Data for jobGrade update", data);
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, jobGradeSchema);
        const jobGradeModel = await getDBModel(DB, "jobGrade");
        //if (!data.uuid) data.uuid = uuidv4();
        const savedJobGrade = await jobGradeModel.updateOne(
          { uuid: data.uuid },
          { $set: data },
          { upsert: true }
        );
        return savedJobGrade;
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };
  
    findJobGrade = async (query, req) => {
      try {
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, jobGradeSchema);
        const jobGradeModel = await getDBModel(DB, "jobGrade");
        return await jobGradeModel.find(query).lean();
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };

    aggregate = async (query, req) => {
      try {
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, jobGradeSchema);
        const jobGradeModel = await getDBModel(DB, "jobGrade");
        return await jobGradeModel.aggregate(query);
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };

    findWithProjection = async (query, req) => {
      try {
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, jobGradeSchema);
        const jobGradeModel = await getDBModel(DB, "jobGrade");
        return await jobGradeModel.find(query, {_id:0, uuid:1, gradeId:1,gradeName:1 }).lean();
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    }
    createAllJobGrades = async (data, req, res) => {
      try {
        let errorList = [];
        let errorCount = 0;
        let sucessList = [];
        let sucessfullyAddedCount = 0;
        let forValidationOnly = data?.forValidationOnly

        const allJobGrades = await this.findJobGrade({},req);
       
        const JobGradeDB = await switchDB(req.subdomain, jobGradeSchema);
        const uploadResultsDB = await switchDB(req.subdomain, uploadResultsSchema);
        
        const jobGradeModel = await getDBModel(JobGradeDB, "jobGrade");
        const uploadResultsModel = await getDBModel(uploadResultsDB, "uploadResults");
        
        let CSVHeader = [];
        
        CSVHeader.push(
          { label: "JobGrade_Id", key: "gradeId" },
          { label: "JobGrade_Name", key: "gradeName" },
          { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate(DD/MM/YYYY)" },
          { label: "Effective_Status", key: "status" },
          { label: "Description", key: "description" },
          { label: "Grade_Salary_Range_Minimum", key :  "gradeSalaryRangeMinimum"},
          { label: "Grade_Salary_Range_MidPoint", key :  "gradeSalaryRangeMidPoint"},
          { label: "Grade_Salary_Range_Maximum", key :  "gradeSalaryRangeMaximum"},
          { label: "Progression_By_Service", key: "progressionByService" },
          { label: "Minimum_Service", key: "minimumService" },
          { label: "Maximum_Service", key: "maximumService" },
          { label: "Progression_By_Reviews_and_Ratings", key: "progressionByReviewsRatings" },
          { label: "Minimum_Number_Of_Reviews", key: "minimumNumberOfReviews" },
          { label: "Minimum_Rating", key: "minimumRating" },
          { label: "Average_Rating", key: "averageRating" },
          { label: "Final_Rating", key: "finalRating" },
          { label: "Progression_By_Age", key: "progressionByAge" },
          { label: "MinimumAge", key: "minimumAge" },
          { label: "NextGrade", key: "nextGrade" },
        );
        let createUploadResult = []
        if(!forValidationOnly){
          let uploadingData = {
            type: "JobGrade",
            uploadedBy: req.subdomain,
            fileName: data.fileName,
            errorFileName: data.fileName,
            status: "InProgress",
            uploadedData: data.data,
            createdAt: new Date(),
            csvHeader: CSVHeader,
          };
          createUploadResult = await uploadResultsModel.insertMany(
            [uploadingData],
            {
              runValidators: true,
            }
          );
        }
        for (let i = 0; i < data.data?.length > 0; i++) {
          const jobGrade = data.data[i];
          
          console.log("processing the record: ", i + 1);
          const errors = await jobGradeUtils.validateJobGrade(
            jobGrade,
            allJobGrades,
          );
          if (errors.length > 0) {
            const errorData = { ...jobGrade };
            errorData.errors = errors;
            errorList.push(errorData);
            errorCount++;
          } else {
            try {
              if(!forValidationOnly){
                const jobGradeData = {
                  ...jobGrade,
                };
               
                if(jobGrade?.nextGrade && allJobGrades?.length>0) {
                  jobGradeData.nextGrade = allJobGrades.find(e => e.gradeId == jobGrade.nextGrade)?.uuid
                }
                jobGradeData["effectiveDate"] = new Date(
                  moment(jobGrade.effectiveDate, "DD/MM/YYYY")
                );
              
                const savedJobGrade = await jobGradeModel.insertMany(
                  [jobGradeData],
                  { runValidators: true }
                );
                if (savedJobGrade.length > 0) {
                  savedJobGrade["errors"] = [];
                  sucessList.push(jobGradeData);
                  sucessfullyAddedCount++;
                }
              } else {
                const errorData = { ...jobGrade };
                errorData.errors = [];
                errorList.push(errorData);
              }
            } catch (error) {
              const errorData = { ...jobGrade };
              errorData.errors =  error?.errors?.code ? error?.errors?.code?.properties?.message : error.message; 
              errorList.push(errorData);
              errorCount++;
              console.log("error occured while saving record", i + 1);
              console.log("err", error);
            }
          }
          console.log("processed record", i + 1);
        }
        if(!forValidationOnly){
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
        }
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
  
  module.exports = new JobGradeService();
  