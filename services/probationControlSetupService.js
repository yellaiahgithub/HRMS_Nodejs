const { switchDB, getDBModel, probationControlSetupSchema } = require("../middlewares/switchDB");

class ProbationControlSetupService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for probationControlSetup create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, probationControlSetupSchema)
            const probationControlSetupModel = await getDBModel(DB, 'probationControlSetup')
            // add ProbationControlSetupId
            return probationControlSetupModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    
    findProbationControlSetup = async (req, res) => {
        try {
            console.log('Get ProbationControlSetup')
            const companyName = req.subdomain
            const DB = await switchDB(companyName, probationControlSetupSchema)
            const probationControlSetupModel = await getDBModel(DB, 'probationControlSetup')
            return await probationControlSetupModel.findOne().lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (data, req, res) => {
        try {
            console.log('Update ProbationControlSetup, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, probationControlSetupSchema)
            const probationControlSetupModel = await getDBModel(DB, 'probationControlSetup')
            // find and update record in mongoDB
            return await probationControlSetupModel.findOneAndUpdate({ uuid: data.uuid }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new ProbationControlSetupService()