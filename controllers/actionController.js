const ActionService = require('../services/actionService.js');
const {v4: uuidv4} = require('uuid');
const actionModel = require('../models/actions.js');

class Action {
    constructor() { }

    find = async (req, res, next) => {
        try {
            let query = {};
            if (req.query.actionName != undefined) {
                query =  {actionName:  { $regex : req.query.actionName, '$options' : 'i' } } 
            }
            if (req.query.actionCode != undefined) {
                query = {...query, ...{actionCode:  { $regex : req.query.actionCode, '$options' : 'i' } } }
            }
            if (req.query.isActive != undefined) {
                if(req.query.isActive.toLowerCase()=='true'||req.query.isActive.toLowerCase()=='false'){
                const isActive=req.query.isActive.toLowerCase()=='true'
                query = {...query, ...{isActive: isActive } }
                }
                else{
                    throw new Error("Invalid data passed in isActive Variable. Accepted values are True or False")
                }
            }
            // call method to service
            let result = await ActionService.find(query, req, res);
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findActionByActionCode = async (req, res, next) => {
        try {
            console.log('Find Action, Data By: ' + JSON.stringify(req.query))
            let query = {};
           
            if (req.query.actionCode != undefined) {
                query =  {actionCode:   req.query.actionCode } 
            }
            let pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                      from: "reasons",
                      localField: "actionCode",
                      foreignField: "actionCode",
                      as: "reasons"
                    }
                },
            ]
            // call method to service
        let result = await ActionService.aggregation(pipeline, req);

            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findActionByActionCodeLite = async (req, res, next) => {
        try {
            console.log('Find Action, Data By: ' + JSON.stringify(req.query))
            let query = {};
           
            if (req.query.actionCode) {
                query =  {actionCode:   req.query.actionCode } 
            }
            let pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'reasons',
                        let : { "id": "$actionCode" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$actionCode", "$$id"] }}},
                            { "$project": {  _id:0, "reasonName": 1, reasonCode : 1}}
                          ],
                        as: 'reasons',
                    }
                },
                {
                    $unwind: {
                        path: "$reasons",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project:{
                        _id:0,
                        uuid:1,
                        actionId:1,
                        actionCode:1,
                        actionName:1,
                        reasons: "$reasons",
                        
                    }
                }
            ]
            // call method to service
        let result = await ActionService.aggregation(pipeline, req);

            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createAction = async (req, res, next) => {
        try {

            console.log('Create Action, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for action
            // call method to service
            let resp = await ActionService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updateAction = async (req, res) => {
        try {
          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No action data found for update`);
          }
          if (!req.params.actionCode) return apiResponse.errorResponse(res, "Please send ActionCode");
          const data = req.body
          data.updatedAt = new Date()
          let actionCode = req.params.actionCode
          // call method to service
          let resp = await ActionService.update(actionCode, data, req, res);
          if (resp) {
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No action found for the actionCode provided:${actionCode}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }
}

module.exports = new Action()