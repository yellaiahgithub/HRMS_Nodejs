const { switchDB, getDBModel, policySchema } = require("../middlewares/switchDB");

class PolicyService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for policy create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, policySchema)
            const policyModel = await getDBModel(DB, 'policy')
            return await policyModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (req) => {
        try {
            console.log('Get all policies')
            const companyName = req.subdomain
            const DB = await switchDB(companyName, policySchema)
            const policyModel = await getDBModel(DB, 'policy')
            return await policyModel.find().lean()
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new PolicyService()