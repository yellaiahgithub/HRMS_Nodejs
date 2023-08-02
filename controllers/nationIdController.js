const NationalService = require('../services/nationIdService');
const apiResponse = require('../helper/apiResponse');
const {v4: uuidv4} = require('uuid');
const nationIdService = require('../services/nationIdService');

class National {
    constructor() { }

    findNationalById = async (req, res, next) => {
        try {
            console.log('Find National, Data By: ' + JSON.stringify(req.query))
            if (!req.query.employeeUUID) throw new Error("Employee id is required.");
            let query = { employeeUUID: req.query.employeeUUID, isActive: true };
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
                },
                {
                    $addFields: {
                        employeeId: "$employee.id"
                    }
                },
                {
                    $sort:{
                      "isPrimary":-1
                    }
                }

              ]

            let result = await NationalService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('NationID not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find National, Data By: ' + JSON.stringify(req.params))
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
                            { "$project": {  
                                    _id:0,
                                    id : 1,
                                    firstName:1,
                                    lastName:1 
                                }
                            }
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
                    $addFields: {
                        employeeId: "$employee.id",
                        employeeName : {
                            $concat: ["$employee.firstName", " ", "$employee.lastName"],
                        }, 
                    }
                }
              ]

            let result = await NationalService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('National not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createNational = async (req, res, next) => {
        try {

            console.log('Create National, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for National

            // call method to service
            let resp = await NationalService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    updateNational = async (req, res, next) => {
        try {

            console.log('Update National, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            // data.uuid = uuidv4(); // unique id for National

            // call method to service
            let resp = await NationalService.update(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    deleteNationId = async (req, res) => {
        try {
            console.log('Delete NationId, Data : ' + JSON.stringify(req.params))
    
            const data = req.params;
            if (!data.uuid) return apiResponse.notFoundResponse(res, "Please send company UUID");
        
            // call method to service
            let response = await NationalService.delete(data.uuid, req, res);
        
            if (response?.deletedCount == 0) {
                return apiResponse.validationErrorWithData(res, `No NationId found for the UUID provided:${data.uuid}`)
            }
            return apiResponse.successResponse(res, "Successfully deleted NationId")
        
        } catch (error) {
            console.log(error)
            apiResponse.errorResponse(res, error.message)
        }
    }

    createAllNationId = async (req, res, next) => {
        try {
          let data = req.body;
          if (data?.forValidationOnly == undefined) throw new Error("forValidationOnly is required.");
          // call method to service
          let resp = await nationIdService.createAllNationIds(
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

    generateCSVHeader = async (req, res, next) => {
        try {
            let CSVHeader = [];
            CSVHeader.push(
                { label: "EmployeeId", key: "employeeId" },
                { label: "Country", key: "country" },
                { label: "Identification_Type", key: "identificationType" },
                { label: "Identification_Number", key: "IdentificationNumber" },
                { label: "Name_As_Per_Document", key: "name" },
                { label: "Is_Expiry(true/false)", key: "isExpiry" },
                { label: "Expiry_Date(DD/MM/YYYY)", key: "expiry" },
                { label: "Is_Primary(true/false)", key: "isPrimary" },
            );
          const data = {
            CSVHeader: CSVHeader
          };
          return res.status(200).send(data);
        } catch (error) {
          console.error(error);
          res.status(400).send(error.message);
        }
      };
}

module.exports = new National()