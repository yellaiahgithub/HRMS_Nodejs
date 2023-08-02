const StorageController = require("../controllers/StorageController");
const { switchDB, getDBModel, workExperienceSchema, employeeSchema, uploadResultsSchema } = require("../middlewares/switchDB");
const StorageService = require("./StorageService");
const workExperienceUtils = require("../utils/employeeWorkExperienceUtils");

class WorkExperienceService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for workExperience create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')
            return workExperienceModel.insertMany([data], { runValidators: true })
            
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    aggregate = async (pipeline, req) => {
        try {
            console.log('Get WorkExperience, Data By: ' + JSON.stringify(pipeline))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')
            return await workExperienceModel.aggregate(pipeline);
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (query, req, res) => {
        try {
            console.log('Get WorkExperience, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')
            return await workExperienceModel.find(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findWorkExperienceById = async (query, req, res) => {
        try {
            console.log('Get WorkExperience, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')
            return await workExperienceModel.find(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update =  async (data, req, res) => {
        try {
          console.log('Update WorkExperience, Data: ' + JSON.stringify(data))
          const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')
          // find and update record in mongoDB
          return await workExperienceModel.updateOne({ uuid: data.uuid }, { $set: data }, { upsert: true })
        } catch (error) {
            console.log(error)
          throw new Error(error);
        }
      }

      delete = async (query, req) => {
        try {
            console.log("Data for workExperience update", query);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')

            //  if it is the only one record and if isPrimary is true  and is updating as a isPrimary then return with the message
            const exist = await workExperienceModel.find({employeeUUID: query.employeeUUID}).lean();
            if(exist && exist?.length == 1) { 
                return `Can't delete, this is only one record of an employee`;
            }

            return await workExperienceModel.findOneAndDelete(
                query
            );
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      };
      createAllWorkExperiences = async (data, req, res) => {
        try {
          let errorList = [];
          let errorCount = 0;
          let sucessList = [];
          let sucessfullyAddedCount = 0;
          const employeeDB = await switchDB(req.subdomain, employeeSchema);
          const employeeModel = await getDBModel(employeeDB, "employee");
          const allEmployees = await employeeModel.find().lean();

          const WorkExperienceDB = await switchDB(req.subdomain, workExperienceSchema);
          const uploadResultsDB = await switchDB(
            req.subdomain,
            uploadResultsSchema
          );
          const workExperienceModel = await getDBModel(WorkExperienceDB, "workExperience");
          const uploadResultsModel = await getDBModel(
            uploadResultsDB,
            "uploadResults"
          );
          const employementTypeList = ["Full-Time", "Part-Time", "Internship", "Trainee", "Freelance", "Contract based"]
          let CSVHeader = [];
          CSVHeader.push(
            { label: "Employee_Id", key: "employeeId" },
            { label: "Title", key: "title" },
            { label: "Employment_Type", key: "employmentType" },
            { label: "Company_Name", key: "companyName" },
            { label: "Country", key: "country" },
            { label: "State", key: "state" },
            { label: "City", key: "city" },
            { label: "Contact_Number", key: "phoneNo" },
            { label: "Start_Date_Month", key: "startDateMonth" },
            { label: "Start_Date_Year", key: "startDateYear" },
            { label: "End_Date_Month", key: "endDateMonth" },
            { label: "End_Date_Year", key: "endDateYear" },
            { label: "Reporting_Manager_Name", key: "reportingManagerName" },
            { label: "Designation", key: "designation" },
            { label: "Reason_For_Leaving", key: "reasonForLeaving" },
          );
          let uploadingData = {
            type: "WorkExperience",
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
            const workExperience = data.data[i];
            console.log("processing the record: ", i + 1);
            const errors = await workExperienceUtils.validateWorkExperience(
              workExperience,
              allEmployees
            );
            if (errors.length > 0) {
              const errorData = { ...workExperience };
              errorData.errors = errors;
              errorList.push(errorData);
              errorCount++;
            } else {
              try {
                const employeeEmployementTypeIndex = employementTypeList.findIndex(
                  (employmentType) =>
                  employmentType.toLowerCase() == workExperience.employmentType.toLowerCase()
                );
                workExperience.employmentType = employementTypeList[employeeEmployementTypeIndex];
                
                if(workExperience?.employeeId && allEmployees?.length>0) {
                  workExperience.employeeUUID = allEmployees.find(e => e.id == workExperience.employeeId)?.uuid
                }
                
                const workExperienceData = {
                  ...workExperience,
                  isActive: true,
                };
                const savedWorkExperience = await workExperienceModel.insertMany(
                  [workExperienceData],
                  { runValidators: true }
                );
                if (savedWorkExperience.length > 0) {
                  sucessList.push(workExperienceData);
                  sucessfullyAddedCount++;
                }
              } catch (error) {
                const errorData = { ...workExperience };
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

module.exports = new WorkExperienceService()