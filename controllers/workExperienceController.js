const WorkExperienceService = require('../services/workExperienceService.js');
const { v4: uuidv4 } = require('uuid');
const apiResponse = require("../helper/apiResponse");
const { generateMail } = require('../utils/mailNotificationUtils.js');
const { MAIL_NOTIFICATION_TYPE } = require('../constants/commonConstants.js');
const { switchDB, workExperienceSchema } = require('../middlewares/switchDB.js');

class WorkExperience {
    constructor() { }

    findWorkExperienceById = async (req, res, next) => {
        try {
            console.log('Find WorkExperience, Data By: ' + JSON.stringify(req.params))
            if (!req.query.employeeUUID) { throw new Error("employeeUUID not found") }
            let query = {};
            query.employeeUUID = req.query.employeeUUID
            const pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'employee',
                        let : { "id": "$employeeUUID" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$uuid", "$$id"] }}},
                            { "$project": {  _id:0, "id": 1}}
                          ],
                        as: 'employee',
                    }
                },
                {
                    $unwind : {
                        path:"$employee"
                    }
                },
                {
                    $sort:{
                      "endDateYear":-1,
                      "endDateMonth":-1,
                    }
                }
            ]
            let result = await WorkExperienceService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find WorkExperience, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            const pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'employee',
                        let : { "id": "$employeeUUID" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$uuid", "$$id"] }}},
                            { "$project": {  _id:0, "id": 1}}
                          ],
                        as: 'employee',
                    }
                },
                {
                    $unwind : {
                        path:"$employee"
                    }
                }
            ]
            let result = await WorkExperienceService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('workExperience not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createWorkExperience = async (req, res, next) => {
        try {
            console.log('Create WorkExperience, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for workExperience
            
            let resp = await WorkExperienceService.create(data, req, res);

            //send Mail
            const inputObj=resp[0]
            const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
            generateMail(MAIL_NOTIFICATION_TYPE.ADD_PRIOR_WORK_EXPERIENCE,body,req,inputObj)

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }


    updateWorkExperience = async (req, res) => {
        try {
            if (Object.keys(req.body).length === 0) {
                return apiResponse.notFoundResponse(res, `No workExperience data found for update`);
            }
            const data = req.body
            data.updatedAt = new Date()
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')

            // call method to service
            let resp = await WorkExperienceService.update(data, req, res);
            if (resp) {
                const inputObj=await workExperienceModel.findOne({uuid:data.uuid})
                const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
                generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_PRIOR_WORK_EXPERIENCE,body,req,inputObj)  
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No workExperience found for the workExperienceId provided:${data.uuid}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }

    deleteWorkExperienceDetail = async (req, res, next) => {
        try {
            if (!req.query.employeeUUID) throw new Error("employeeUUID is required.");
            if (!req.query.uuid) throw new Error("WorkExperience ID is required.");
            let query = {}
            query.employeeUUID = req.query.employeeUUID
            query.uuid = req.query.uuid
            const companyName = req.subdomain
            const DB = await switchDB(companyName, workExperienceSchema)
            const workExperienceModel = await getDBModel(DB, 'workExperience')
            const inputObj=await workExperienceModel.findOne(query)

            // call method to service
            let response = await WorkExperienceService.delete(query, req);

            if (response?.deletedCount == 0) {
                return res.status(404).send('WorkExperience not found')
            } else if (response ==  `Can't delete, this is only one record of an employee`){
                return apiResponse.validationErrorWithData(res, `Can't delete, this is only one record of an employee`)
            }
            else{
                const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
                generateMail(MAIL_NOTIFICATION_TYPE.DELETE_PRIOR_WORK_EXPERIENCE,body,req,inputObj)  
            }
            return res.status(200).send("Deleted successfully");
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    generateCSVHeader = async (req, res, next) => {
        try {
            let CSVHeader = [];  
          CSVHeader.push(
            { label: "Employee_Id", key: "Employee_Id" },
            { label: "Title", key: "Title" },
            { label: "Employment_Type", key: "Employment_Type" },
            { label: "Company_Name", key: "Company_Name" },
            { label: "Country", key: "Country" },
            { label: "State", key: "State" },
            { label: "City", key: "City" },
            { label: "Contact_Number", key: "Contact_Number" },
            { label: "Start_Date_Month", key: "Start_Date_Month" },
            { label: "Start_Date_Year", key: "Start_Date_Year" },
            { label: "End_Date_Month", key: "End_Date_Month" },
            { label: "End_Date_Year", key: "End_Date_Year" },
            { label: "Reporting_Manager_Name", key: "Reporting_Manager_Name" },
            { label: "Designation", key: "Designation" },
            { label: "Reason_For_Leaving", key: "Reason_For_Leaving" },
          );
          const data = {
            CSVHeader: CSVHeader,
          };
          return res.status(200).send(data);
        } catch (error) {
          console.error(error);
          res.status(400).send(error.message);
        }
      };
      createAllWorkExperiences = async (req, res, next) => {
        try {
          let data = req.body;
    
          // call method to service
          let resp = await WorkExperienceService.createAllWorkExperiences(
            data,
            req,
            res
          );
    
          return res.status(200).send(resp);
        } catch (error) {
          console.error(error);
          res.status(400).send(error.message);
        }
      };
}

module.exports = new WorkExperience()