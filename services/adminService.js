
const {switchDB, getDBModel, adminSchema} = require("../middlewares/switchDB");
const conf = require("../conf/conf");

class AdminService {
    constructor() { }


    create = async (data, req) => {
        try {
            console.log('Data for admin create', data);
            const companyName = conf.DB_NAME
            const companyDB = await switchDB(companyName, adminSchema)
            const adminModel = await getDBModel(companyDB, 'admin')
            return await adminModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }


    findAll = async (query, req) => {
        try {
            console.log('Get User, Data By: ' + JSON.stringify(query))
            const companyName = conf.DB_NAME
            const companyDB = await switchDB(companyName, adminSchema)
            const adminModel = await getDBModel(companyDB, 'admin')
            return await adminModel.find(query)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findUserById = async (query, req) => {
        try {
            console.log('Get User, Data By: ' + JSON.stringify(query))
            const companyName = conf.DB_NAME
            const companyDB = await switchDB(companyName, adminSchema)
            const adminModel = await getDBModel(companyDB, 'admin')
            return await adminModel.findOne(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

}

module.exports = new AdminService()