const AdminService = require('../services/adminService');
const {v4: uuidv4} = require('uuid');

class Admin {
    constructor() { }

    findUserById = async (req, res, next) => {
        try {
            console.log('Find User, Data By: ' + JSON.stringify(req.params))
            if (!req.params.uuid) throw new Error("User id is required.");
            let query = { uuid: req.params.uuid, isActive: true };
            // call method to service
            let result = await AdminService.findUserById(query, res);

            if (!result) {
                return res.status(404).send('user not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find User, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let result = await AdminService.findAll(query, res);

            if (!result) {
                return res.status(404).send('user not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createUser = async (req, res, next) => {
        try {

            console.log('Create User, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for user

            // call method to service
            let resp = await AdminService.create(data, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    // Update companyName in Mysession and in session.
    updateSession = async (req, res, next) => {
        try {
            console.log('Update companyName in Mysession: ' + JSON.stringify(req.body))
            if(!req.body.companyName) throw Error("CompanyName required") 
            const companyName = req.body.companyName
            req.session.userDetails.companyName = companyName;
            req.session.save(function(err){
                console.log('updateSession session save err', err)
            });
            return res.status(200).send(req.session);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new Admin()