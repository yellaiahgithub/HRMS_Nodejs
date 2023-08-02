const ModuleAccessService = require('../services/moduleAccessService.js');
const apiResponse = require('../helper/apiResponse');
const {v4: uuidv4} = require('uuid');

class ModuleAccess {
    constructor() { }

    createModuleAccess = async (req, res, next) => {
        try {

            console.log('Create ModuleAccess, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            // data.uuid = uuidv4(); // unique id for ModuleAccess

            // call method to service
            let resp = await ModuleAccessService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findModuleAccessByCompanyId = async (req, res, next) => {
        try {
            console.log('Find ModuleAccess, Data By: ' + JSON.stringify(req.query))
            if (!req.query.companyId) throw new Error("companyId is required.");
            let query = { companyId: req.query.companyId, isActive: true };
            // call method to service
            let result = await ModuleAccessService.findModuleAccessBy(query, req);

            if (!result) {
                return res.status(404).send('moduleAccess not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find ModuleAccess, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let result = await ModuleAccessService.findAll(query, req, res);

            if (!result) {
                return res.status(404).send('ModuleAccess not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    
    updateModuleAccess = async (req, res, next) => {
        try {

            console.log('Update ModuleAccess, Data By: ' + JSON.stringify(req.body))
            let data = req.body;

            // call method to service
            let resp = await ModuleAccessService.update(data, req);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    getModuleNames = async (req, res, next) => {
        try {
            let modules = ["Core HR", "Leave Management", "India Payroll"];
            return res.status(200).send(modules)
        } catch (error) {
            console.error('getModuleNames Error', error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new ModuleAccess()