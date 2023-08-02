const ProbationSetupService = require('../services/probationSetupService.js');
const { v4: uuidv4 } = require('uuid');

class ProbationSetup {
    constructor() { }

    createProbationSetup = async (req, res, next) => {
        try {

            console.log('Create ProbationSetup, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for probationSetup
            
            // call method to service
            let resp = await ProbationSetupService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    find = async (req, res, next) => {
        try {
            console.log('Find ProbationSetup, Data By: ' + JSON.stringify(req.query))
            let query = {};
            
            if (req.query.probationSetupUUID != undefined) {
                query = { uuid: req.query.probationSetupUUID }
            }
            // call method to service
            let result = await ProbationSetupService.findProbationSetupById(query, req, res);

            if (!result) {
                return res.status(404).send('No Matching Results Found')
            }
            if(req.query.getSetupBy){
                if(req.query.getSetupBy.toLowerCase()=="true".toLowerCase())
                  return res.status(200).send(result.setupBy);
              }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    getProbationDate = async (req, res, next) => {
        try {
            console.log('Find ProbationSetup, Data By: ' + JSON.stringify(req.query))
            const data = req.query          
            const companyName  =  req.subdomain
            // call method to service
            let result = await ProbationSetupService.getProbationDate(data, companyName);

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
                throw new Error(`No probationSetup data found for update`);
            }
            if (!req.body.uuid) throw new Error("Please send uuid in body");

            const data = req.body
            data.updatedAt = new Date()
            // call method to service
            let resp = await ProbationSetupService.update(data, req, res);
            if (resp) {
                return res.status(200).send(resp)
            } else {
                return res.status(400).send(`No probationSetup found for the probationSetupId provided:${probationSetupId}`);
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new ProbationSetup()