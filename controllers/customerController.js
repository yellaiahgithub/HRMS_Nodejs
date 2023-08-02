const CustomerService = require('../services/customerService');
const {v4: uuidv4} = require('uuid');

class Customer {
    constructor() { }

    findCustomerById = async (req, res, next) => {
        try {
            console.log('Find Customer, Data By: ' + JSON.stringify(req.params))
            if (!req.params.uuid) throw new Error("Customer id is required.");
            let query = { uuid: req.params.uuid, isActive: true };
            // call method to service
            let result = await CustomerService.findCustomerById(query, req, res);

            if (!result) {
                return res.status(404).send('Customer not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find Customer, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let result = await CustomerService.findAll(query, req, res);

            if (!result) {
                return res.status(404).send('Customer not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createCustomer = async (req, res, next) => {
        try {

            console.log('Create Customer, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for Customer

            // call method to service
            let resp = await CustomerService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
    updateCustomer = async (req, res, next) => {
        try {

            console.log('Update Customer, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            // data.uuid = uuidv4(); // unique id for Customer

            // call method to service
            let resp = await CustomerService.update(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new Customer()