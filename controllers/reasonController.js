const ReasonService = require('../services/reasonService');
const { v4: uuidv4 } = require('uuid');
const reasonModel = require('../models/reasons');

class Reason {
    constructor() { }

    findReasonById = async (req, res, next) => {
        try {
            console.log('Find Reason, Data By: ' + JSON.stringify(req.params))
            if (!req.query.reasonName && !req.query.reasonCode) { throw new Error("No data found for search reason") }
            let query = {};
            if (req.query.reasonName != undefined) {
                query = { reasonName: { $regex: req.query.reasonName, '$options': 'i' } }
            }
            if (req.query.reasonCode != undefined) {
                query = { reasonCode: { $regex: req.query.reasonCode, '$options': 'i' } }
            }
            // call method to service
            let result = await ReasonService.findReasonById(query, req, res);

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
            console.log('Find Reason, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let result = await ReasonService.findAll(query, req, res);

            if (!result) {
                return res.status(404).send('reason not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findReasonByAction = async (req, res, next) => {
        try {
            if (!req.params.actionCode)
            throw new Error("Action Code is required.");
            let query = { actionCode:req.params.actionCode, isActive: true };
            // call method to service
            let result = await ReasonService.findAll(query, req, res);

            if (!result) {
                return res.status(404).send('reason not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAllActionReasons = async (req, res, next) => {
        try {
            console.log('Find All Action Reasons, Data')
            // call method to service
            let result = await ReasonService.findAllActionReasons(req, res);

            if (!result) {
                return res.status(404).send('actionReasons not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createReason = async (req, res, next) => {
        try {

            console.log('Create Reason, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for reason
            
            // call method to service
            let resp = await ReasonService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }


    updateReason = async (req, res) => {
        try {
            if (Object.keys(req.body).length === 0) {
                return apiResponse.notFoundResponse(res, `No reason data found for update`);
            }
            if (!req.params.reasonCode) return apiResponse.errorResponse(res, "Please send ReasonId");

            const data = req.body
            data.updatedAt = new Date()
            let reasonCode = req.params.reasonCode
            // call method to service
            let resp = await ReasonService.update(reasonCode, data, req, res);
            if (resp) {
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No reason found for the reasonCode provided:${reasonCode}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new Reason()