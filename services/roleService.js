const { switchDB, getDBModel, rolesSchema } = require("../middlewares/switchDB");
const conf = require("../conf/conf");

class RoleService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for role create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, rolesSchema)
            const roleModel = await getDBModel(DB, 'roles')
            return await roleModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (pipeline, req, res) => {
        try {
            console.log('Get role, Data By: ' + JSON.stringify(pipeline))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, rolesSchema)
            const roleModel = await getDBModel(DB, 'roles')
            return await roleModel.aggregate(pipeline)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findRoleById = async (query, req, res) => {
        try {
            console.log('Get role, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, rolesSchema)
            const roleModel = await getDBModel(DB, 'roles')
            return await roleModel.aggregate(query);
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (roleId, data, req, res) => {
        try {
            console.log('Update role, Data: ' + JSON.stringify(data))
            // find and update record in mongoDB
            const companyName = req.subdomain
            const DB = await switchDB(companyName, rolesSchema)
            const roleModel = await getDBModel(DB, 'roles')
            return await roleModel.findOneAndUpdate({ roleId: roleId }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new RoleService()