const LeavePolicyService = require('../services/leavePolicyService.js');
const { v4: uuidv4 } = require('uuid');
const apiResponse = require("../helper/apiResponse");

class LeavePolicy {
    constructor() { }

    createLeavePolicy = async (req, res, next) => {
        try {

            console.log('Create LeavePolicy, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for leavePolicy
            // call method to service
            let resp = await LeavePolicyService.create(data, req, res);
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findBy = async (req, res, next) => {
        try {
            console.log('Find LeavePolicy, Data By: ' + JSON.stringify(req.query))
            let query = {};
            query.isActive = true
            if (req.query.uuid != undefined) {
                query.uuid =   req.query.uuid 
            }
            if (req.query?.leaveTypeUUID != undefined) {
                query.leaveTypeUUID =   req.query.leaveTypeUUID 
            }
            // call method to service
            let result = await LeavePolicyService.findBy(query, req, res);

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
            console.log('Find LeavePolicy, Data By: ' + JSON.stringify(req.query))
            let query = {};
            query.isActive = true
            if (req.query.uuid != undefined) {
                query.uuid =   req.query.uuid 
            }
            if (req.query?.leaveTypeUUID != undefined) {
                query.leaveTypeUUID =   req.query.leaveTypeUUID 
            }
            let pipeline =[
                {
                    $match:{
                        ...query
                    }
                },
                {
                    $lookup: {
                        from: 'leaveType',
                        let : { "id": "$leaveTypeUUID" },
                        "pipeline": [
                            { "$match": {
                                  $expr: {
                                        $eq: ['$uuid', '$$id']
                                      }
                                },
                            },
                            { "$project": {  
                                _id:0,
                                name: 1
                                }
                             }
                          ],
                        as: 'leaveType',
                    }
                  },
                  {
                      $unwind: {
                      path: "$leaveType",
                      preserveNullAndEmptyArrays : true
                      },
                  }
            ]
            // call method to service
            let result = await LeavePolicyService.findAll(pipeline, req, res);

            if (!result) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    
    updateLeavePolicy = async (req, res) => {
        try {
            if (Object.keys(req.body).length === 0) {
                return apiResponse.notFoundResponse(res, `No leavePolicy data found for update`);
            }
            if (!req.params.uuid) return apiResponse.errorResponse(res, "Please send uuid");

            const data = req.body
            data.updatedAt = new Date()
            let uuid = req.params.uuid
            // call method to service
            let resp = await LeavePolicyService.update(uuid, data, req, res);
            if (resp) {
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No leavePolicy found for the uuid provided:${uuid}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new LeavePolicy()