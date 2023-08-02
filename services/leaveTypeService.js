const { switchDB, getDBModel, leaveTypeSchemas } = require('../middlewares/switchDB');

class LeaveTypeService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for leavetype create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, leaveTypeSchemas)
            const leavetypeModel = await getDBModel(DB, 'leaveType')
            const savedLeaveType = leavetypeModel.insertMany([data], { runValidators: true })
            return savedLeaveType;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (query, req, res) => {
        try {
            console.log('Get LeaveType, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, leaveTypeSchemas)
            const leavetypeModel = await getDBModel(DB, 'leaveType')
            if(Object.keys(query)?.length > 1) {
                return await leavetypeModel.findOne(query,  {_id:0, id:1, uuid:1, name:1, effectiveDate:1, isActive:1}).lean();
            } else {
                return await leavetypeModel.find(query, {_id:0, id:1, uuid:1, name:1, effectiveDate:1, isActive:1}).sort({ createdAt: 1 }).lean()
            }
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (uuid, data, req, res) => {
        try {
            console.log('Update LeaveType, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, leaveTypeSchemas)
            const leavetypeModel = await getDBModel(DB, 'leaveType')
            // find and update record in mongoDB
            return await leavetypeModel.findOneAndUpdate({ uuid: uuid }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }
}

module.exports = new LeaveTypeService()