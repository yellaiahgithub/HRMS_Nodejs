const {
    switchDB,
    getDBModel,
    bankSchema,
    bankBranchSchema,
} = require("../middlewares/switchDB");
const BankService = require("../services/bankService.js");

class BankBranchService {
    constructor() { }

    createBankBranch = async (data, req, res) => {
        try {
            console.log("Data for bankBranch create", data);
            const companyName = req.subdomain;
            // for branchId
            const bankDB = await switchDB(companyName, bankSchema);
            const bankModel = await getDBModel(bankDB, "bank");
            let bank = await bankModel.findOne({ isActive: true , uuid: data.bankUUID}).lean()
           
            const DB = await switchDB(companyName, bankBranchSchema);
            const bankBranchModel = await getDBModel(DB, "bankBranch");
            let branchesCount = await bankBranchModel.countDocuments({ isActive: true , bankUUID: data.bankUUID})
            if (!branchesCount) {
                branchesCount = 1
            } else {
                branchesCount++;
            }
            let str = "" + branchesCount
            let pad = "000"
            let ans = pad.substring(0, pad.length - str.length) + str
            data.branchId = (bank?.name?.slice(0, 4)).toUpperCase() + "" + ans
            
           
            const savedBankBranch = await bankBranchModel.insertMany([data], {
                runValidators: true,
            });

            return savedBankBranch;
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };

    findAll = async (req) => {
        try {
            const companyName = req.subdomain;
            const DB = await switchDB(companyName, bankBranchSchema);
            const bankBranchModel = await getDBModel(DB, "bankBranch");
            return await bankBranchModel.find();
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };

    findBankBranch = async (query, req, res) => {
        try {
            console.log("Get bankBranch, Data By: " + JSON.stringify(query));
            const companyName = req.subdomain;
            const DB = await switchDB(companyName, bankBranchSchema);
            const bankBranchModel = await getDBModel(DB, "bankBranch");
            return await bankBranchModel.find(query).lean();
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };

    aggregate = async (query, req) => {
        try {
            console.log("Get bankBranch, Data By: " + JSON.stringify(query));
            const companyName = req.subdomain;
            const DB = await switchDB(companyName, bankBranchSchema);
            const bankBranchModel = await getDBModel(DB, "bankBranch");
            return await bankBranchModel.aggregate(query);
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };
}

module.exports = new BankBranchService();
