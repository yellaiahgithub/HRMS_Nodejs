const { switchDB, getDBModel, passwordRuleSchema } = require("../middlewares/switchDB");
const conf = require("../conf/conf");
const {v4: uuidv4} = require('uuid');

class passwordRuleService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for passwordRule create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, passwordRuleSchema)
            const passwordRuleModel = await getDBModel(DB, 'passwordRule')
            data.uuid=uuidv4()
            return await passwordRuleModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    
    get = async (query, req) => {
        try {
            console.log('Get passwordRule, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, passwordRuleSchema)
            const passwordRuleModel = await getDBModel(DB, 'passwordRule')
            return await passwordRuleModel.findOne(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (companyUUID, data, req) => {
        try {
            console.log('Update passwordRule, Data: ' + JSON.stringify(data))
            // find and update record in mongoDB
            const companyName = req.subdomain
            const DB = await switchDB(companyName, passwordRuleSchema)
            const passwordRuleModel = await getDBModel(DB, 'passwordRule')
            data.updatedAt=new Date();
            return await passwordRuleModel.updateOne({ uuid: data.uuid }, { $set: data }, { new : true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    

}

module.exports = new passwordRuleService()