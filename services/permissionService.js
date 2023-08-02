const { switchDB, getDBModel, permissionsSchema } = require("../middlewares/switchDB");
const conf = require("../conf/conf");

class PermissionService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for permission create', data);
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, permissionsSchema)
            const permissionModel = await getDBModel(DB, 'permissions')
            return await permissionModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (pipeline, req, res) => {
        try {
            console.log('Get permission, Data By: ' + JSON.stringify(pipeline))
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, permissionsSchema)
            const permissionModel = await getDBModel(DB, 'permissions')
            return await permissionModel.aggregate(pipeline)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findPermissionById = async (query, req, res) => {
        try {
            console.log('Get permission, Data By: ' + JSON.stringify(query))
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, permissionsSchema)
            const permissionModel = await getDBModel(DB, 'permissions')
            return await permissionModel.aggregate(query);
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (permissionId, data, req, res) => {
        try {
            console.log('Update permission, Data: ' + JSON.stringify(data))
            // find and update record in mongoDB
            const companyName = conf.DB_NAME
            const DB = await switchDB(companyName, permissionsSchema)
            const permissionModel = await getDBModel(DB, 'permissions')
            return await permissionModel.findOneAndUpdate({ permissionId: permissionId }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    getPermissionCounts = async(req) => {
        
        const companyName = conf.DB_NAME
        const DB = await switchDB(companyName, permissionsSchema)
        const permissionModel = await getDBModel(DB, 'permissions')
        return await permissionModel.countDocuments({})
        
    }

}

module.exports = new PermissionService()