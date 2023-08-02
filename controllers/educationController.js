const EducationService = require('../services/educationService.js');
const {v4: uuidv4} = require('uuid');


class Education {
    constructor() { }

    findEducationById = async (req, res, next) => {
        try {
            console.log('Find Education, Data By: ' + JSON.stringify(req.params))
            if(!req.query.employeeUUID) { throw new Error("employeeUUID not found")}
            let query = {};
            query.employeeUUID  = req.query.employeeUUID
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
                        'isHighestEducation':-1,
                        'yearOfPassing':-1
                    }
                }
            ]
            let result = await EducationService.aggregate(pipeline, req);

            if (!result) {
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
            console.log('Find Education, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
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
            let result = await EducationService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('education not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createEducation = async (req, res, next) => {
        try {
            console.log('Create Education, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for education
            // call method to service
            let resp = await EducationService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }


    updateEducation = async (req, res) => {
        try {
          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No education data found for update`);
          }
          const data = req.body
          data.updatedAt = new Date()
          
          // call method to service
          let resp = await EducationService.update(data, req, res);
          if (resp) {
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No education found for the educationId provided:${educationId}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }

      deleteEducationDetail = async (req, res, next) => {
        try {
            
            if (!req.query.employeeUUID) throw new Error("employeeUUID is required.");
            if (!req.query.levelOfEducation) throw new Error("levelOfEducation is required.");
            if (!req.query.nameOfDegree) throw new Error("nameOfDegree is required.");
            let query = {}
            query.employeeUUID = req.query.employeeUUID 
            query.levelOfEducation = req.query.levelOfEducation 
            query.nameOfDegree = req.query.nameOfDegree 
            // call method to service
            let result = await EducationService.delete(query, req);

            if (!result) {
                return res.status(404).send('EducationDetail not found in the database')
            }
            return res.status(200).send("Deleted");
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new Education()