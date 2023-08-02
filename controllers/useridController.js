const UserIdService = require('../services/useridService.js');
const {v4: uuidv4} = require('uuid');
const apiResponse = require('../helper/apiResponse');
class UserId {
    constructor() { }

    findUserIdById = async (req, res, next) => {
        try {
            console.log('Find UserId, Data By: ' + JSON.stringify(req.params))
            if (!req.params.uuid) throw new Error("UserId is required.");
            let query = { uuid: req.params.uuid, isActive: true };
            // call method to service
            
            let result = await UserIdService.findUserIdById(query, req);

            if (!result || result.length == 0) {
                return res.status(404).send('UserId not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find UserId, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let result = await UserIdService.findAll(query, req);

            if (!result || result.length == 0) {
                return res.status(404).send('UserId not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createUserId = async (req, res, next) => {
        try {

            console.log('Create UserId, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            
            let resp;
            // call method to service
            if(data.action == 'CREATE') {
                data.uuid = uuidv4(); // unique id for UserId
                resp = await UserIdService.create(data, req);
            } else {
                resp = await UserIdService.update(data, req);
            }
            
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    updateUserId = async (req, res, next) => {
        try {

            console.log('Update UserId, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            // data.uuid = uuidv4(); // unique id for UserId

            // call method to service
            let resp = await UserIdService.update(data, req);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    // Delete userIds by employeeUUID
    deleteUserId = async (req, res) => {
        try {
            console.log('Delete UserId, Data : ' + JSON.stringify(req.params))
            if (!req.params.employeeUUID) throw new Error("employeeUUID is required.");
            const employeeUUID = req.params.employeeUUID
            // call method to service
            let response = await UserIdService.delete(employeeUUID, req);
        
            if (response?.deletedCount == 0) {
                return apiResponse.validationErrorWithData(res, `No UserId found for the UUID provided:${data.uuid}`)
            }
            return apiResponse.successResponse(res, "Successfully deleted UserId")
        
        } catch (error) {
            console.log(error)
            apiResponse.errorResponse(res, error.message)
        }
      }
}

module.exports = new UserId()