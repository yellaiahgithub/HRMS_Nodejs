const { switchDB, getDBModel, companyPolicySchema } = require("../middlewares/switchDB");

class CompanyPolicyService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for companyPolicy create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, companyPolicySchema)
            const companyPolicyModel = await getDBModel(DB, 'companyPolicy')
            return await companyPolicyModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (req) => {
        try {
            console.log('Get all policies')
            const companyName = req.subdomain
            const DB = await switchDB(companyName, companyPolicySchema)
            const companyPolicyModel = await getDBModel(DB, 'companyPolicy')
            return await companyPolicyModel.find().lean()
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new CompanyPolicyService()