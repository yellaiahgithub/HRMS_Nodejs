const PolicyService = require('../services/policyService');
const {v4: uuidv4} = require('uuid');

class Policy {
    constructor() { }

    createPolicy = async (req, res, next) => {
        try {

            console.log('Create Policy, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for Policy
            // call method to service
            let resp = await PolicyService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find Policy, Data By: ' + JSON.stringify(req.params))
            // call method to service
            let result = await PolicyService.findAll(req);

            if (!result) {
                return res.status(404).send('Policies not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new Policy()