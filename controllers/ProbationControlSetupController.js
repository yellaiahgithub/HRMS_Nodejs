const probationControlSetupService = require('../services/probationControlSetupService.js');
const { v4: uuidv4 } = require('uuid');

class ProbationControlSetup {
    constructor() { }

    createProbationControlSetup = async (req, res, next) => {
        try {

            console.log('Create ProbationControlSetup, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for probationControlSetup
            
            // call method to service
            let resp = await probationControlSetupService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    find = async (req, res, next) => {
        try {
            console.log('Find ProbationControlSetup, Data By: ' + JSON.stringify(req.query))
            
            // call method to service
            let result = await probationControlSetupService.findProbationControlSetup(req, res);

            if (!result) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    update = async (req, res) => {
        try {
            if (Object.keys(req.body).length === 0) {
                throw new Error(`No probationControlSetup data found for update`);
            }
            if (!req.body.uuid) throw new Error("Please send uuid in body");

            const data = req.body
            data.updatedAt = new Date()
            // call method to service
            let resp = await probationControlSetupService.update(data, req, res);
            if (resp) {
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No probationControlSetup found for the probationControlSetupId provided:${probationControlSetupId}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new ProbationControlSetup()