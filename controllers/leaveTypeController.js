const LeaveTypeService = require('../services/leaveTypeService');
const { v4: uuidv4 } = require('uuid');
const apiResponse = require("../helper/apiResponse");

class LeaveType {
    constructor() { }

    createLeaveType = async (req, res, next) => {
        try {

            console.log('Create LeaveType, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for leavetype
            // call method to service
            let resp = await LeaveTypeService.create(data, req, res);
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find LeaveType, Data By: ' + JSON.stringify(req.query))
            let query = {};
            query.isActive = true
            if (req.query.uuid != undefined) {
                query.uuid =   req.query.uuid 
            }
            // call method to service
            let result = await LeaveTypeService.findAll(query, req, res);

            if (!result) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    
    updateLeaveType = async (req, res) => {
        try {
            if (Object.keys(req.body).length === 0) {
                return apiResponse.notFoundResponse(res, `No leavetype data found for update`);
            }
            if (!req.params.uuid) return apiResponse.errorResponse(res, "Please send uuid");

            const data = req.body
            data.updatedAt = new Date()
            let uuid = req.params.uuid
            // call method to service
            let resp = await LeaveTypeService.update(uuid, data, req, res);
            if (resp) {
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No leavetype found for the leavetypeId provided:${uuid}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new LeaveType()