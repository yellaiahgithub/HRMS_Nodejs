const BankBranchService = require("../services/bankBranchService.js");

class BankBranch {
    constructor() { }

    findBankBranchesBy = async (req, res, next) => {
        try {
            //if (Object.keys(req.query).length == 0) throw new Error("BankBranch name/bankId/uuid is required.");
            let query = {}
            if (req.query.uuid != undefined) {
                query.uuid = req.query.uuid
            }
            if (req.query.bankUUID != undefined) {
                query.bankUUID = req.query.bankUUID
            }
            if (req.query.name != undefined) {
                query.name = new RegExp(req.query.name, "i");
            }
            if (req.query.ifscCode != undefined) {
                query.ifscCode = req.query.ifscCode
            }
            if (req.query.micrCode != undefined) {
                query.micrCode = req.query.micrCode
            }
            // call method to service
            let pipline = [
                {
                    $match: query
                },
                {
                    
                        $lookup: {
                          from: "bank",
                          localField: "bankUUID",
                          foreignField: "uuid",
                          as: "bank",
                        },
                },
                {
                    $unwind: {
                        path: "$bank",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id:0,
                        uuid:1,
                        name: 1,
                        branchId: 1,
                        ifscCode :  1,
                        micrCode : 1,
                        asOfDate :1,
                        addressLine1: 1,
                        addressLine2: 1,
                        country: 1,
                        state: 1,
                        city: 1,
                        pinCode:1,
                        bankUUID: 1,
                        bankName :  "$bank.name"
                    }
                }
                
            ]
            let result = await BankBranchService.aggregate(pipline, req);

            if (!result) {
                return res.status(404).send("BankBranch not found in the database");
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };

    findAll = async (req, res, next) => {
        try {
            console.log("Find BankBranch, Data By: " + JSON.stringify(req.params));
            // call method to service
            let result = await BankBranchService.findAll(req);

            if (!result) {
                return res.status(404).send("BankBranch not found in the database");
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };


    createBankBranch = async (req, res, next) => {
        try {
            console.log("Create BankBranch, Data By: " + JSON.stringify(req.body));
            let data = req.body;
            // call method to service
            let resp = await BankBranchService.createBankBranch(data, req, res);

            return res.status(200).send(resp);
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    };
}

module.exports = new BankBranch();
