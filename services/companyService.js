const { switchDB, getDBModel, companySchemas } = require("../middlewares/switchDB");
const conf = require("../conf/conf");

class CompanyService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for company create', data);
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, companySchemas)
            const companyModel = await getDBModel(DB, 'company')
            return await companyModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (pipeline, req, res) => {
        try {
            console.log('Get company, Data By: ' + JSON.stringify(pipeline))
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, companySchemas)
            const companyModel = await getDBModel(DB, 'company')
            return await companyModel.aggregate(pipeline)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findCompanyById = async (query, req, res) => {
        try {
            console.log('Get company, Data By: ' + JSON.stringify(query))
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, companySchemas)
            const companyModel = await getDBModel(DB, 'company')
            return await companyModel.aggregate(query);
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findByQuery = async (query, req, res) => {
        try {
            console.log('Get company, Data By: ' + JSON.stringify(query))
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, companySchemas)
            const companyModel = await getDBModel(DB, 'company')
            return await companyModel.find(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (companyId, data, req, res) => {
        try {
            console.log('Update company, Data: ' + JSON.stringify(data))
            // find and update record in mongoDB
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, companySchemas)
            const companyModel = await getDBModel(DB, 'company')
            return await companyModel.findOneAndUpdate({ companyId: companyId }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    getCompanyCounts = async(req) => {
        try {
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, companySchemas)
            const companyModel = await getDBModel(DB, 'company')
            return await companyModel.countDocuments({isActive: true})
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

}

module.exports = new CompanyService()