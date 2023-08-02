const { switchDB, getDBModel, leavePolicySchema, leaveTypeSchemas } = require('../middlewares/switchDB');

class LeavePolicyService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for leavePolicy create', data);
            const companyName = req.subdomain

            const DBlt = await switchDB(companyName, leaveTypeSchemas)
            const leaveTypeModel = await getDBModel(DBlt, 'leaveType')
            const leaveType = await leaveTypeModel.findOne({uuid:data.leaveTypeUUID, isActive: true}, {_id:0, uuid:1}).lean();
            if(!leaveType) {
                throw new Error("Leave Type should be valid and active", data.leaveTypeUUID);    
            }
            // To Service should be greater than From Service.
            data.grantRules.map((service)=>{
            if(service.toService > service.fromService){
                throw new Error(`In GrantRules To Service ${service.toService} should be greater than From Service ${service.toService}`);    
            }})
            const DB = await switchDB(companyName, leavePolicySchema)
            const leavePolicyModel = await getDBModel(DB, 'leavePolicy')
            const savedLeavePolicy = leavePolicyModel.insertMany([data], { runValidators: true })
            return savedLeavePolicy;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findBy = async (query, req, res) => {
        try {
            console.log('Get LeavePolicy, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, leavePolicySchema)
            const leavePolicyModel = await getDBModel(DB, 'leavePolicy')
            if(req.query?.uuid) {
                return await leavePolicyModel.findOne(query).lean();
            } else {
                return await leavePolicyModel.find(query).sort({ createdAt: 1 }).lean()
            }
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (pipeline, req, res) => {
        try {
            console.log('Get LeavePolicy, Data By: ' + JSON.stringify(pipeline))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, leavePolicySchema)
            const leavePolicyModel = await getDBModel(DB, 'leavePolicy')
            
            return await leavePolicyModel.aggregate(pipeline)
            
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (uuid, data, req, res) => {
        try {
            console.log('Update LeavePolicy, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, leavePolicySchema)
            const leavePolicyModel = await getDBModel(DB, 'leavePolicy')
            // find and update record in mongoDB
            return await leavePolicyModel.findOneAndUpdate({ uuid: uuid }, { $set: data }, { new: true, context: 'query', runValidators: false })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new LeavePolicyService()