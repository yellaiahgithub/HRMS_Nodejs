const BankService = require("../services/bankService.js");

class Bank {
    constructor() { }

    findBankByIdOrName = async (req, res, next) => {
        try {
            if (!req.query.name && !req.query.bankId && !req.query.uuid) throw new Error("Bank name/bankId/uuid is required.");
            let query = {}
            if (req.query.bankId != undefined) {
                query.bankId = req.query.bankId
            }
            if (req.query.uuid != undefined) {
                query.uuid = req.query.uuid
            }
            if (req.query.name != undefined) {
                query.name = new RegExp(req.query.name, "i");
            }
            // call method to service
            let result = await BankService.findBank(query, req, res);

            if (!result) {
                return res.status(404).send("Bank not found in the database");
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

    findAll = async (req, res, next) => {
        try {
            console.log("Find Bank, Data By: " + JSON.stringify(req.params));
            // call method to service
            let result = await BankService.findAll(req);

            if (!result) {
                return res.status(404).send("Bank not found in the database");
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };


    createBank = async (req, res, next) => {
        try {
            console.log("Create Bank, Data By: " + JSON.stringify(req.body));
            let data = req.body;
            // call method to service
            let resp = await BankService.createBank(data, req, res);

            return res.status(200).send(resp);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

    findBankWithBranches = async (req, res, next) => {
        try {
            console.log("Get All Banks with Branches ");
            // call method to service
            let result = await BankService.findBankWithBranches(req , res);

            if (!result) {
                return res.status(404).send("Banks not found in the database");
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

}

module.exports = new Bank();
