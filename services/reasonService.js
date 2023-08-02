const { switchDB, getDBModel, reasonSchemas } = require("../middlewares/switchDB");

class ReasonService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for reason create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, reasonSchemas)
            const reasonModel = await getDBModel(DB, 'reason')
            // add ReasonId
            let letCounts = "001"
            letCounts = await reasonModel.countDocuments({ isActive: true })
            if (!letCounts) {
                letCounts = 1
            } else {
                letCounts++;
            }
            let str = "" + letCounts
            let pad = "000"
            let ans = pad.substring(0, pad.length - str.length) + str
            data.reasonId = (data?.reasonName?.slice(0, 3)).toUpperCase() + "" + ans
            return reasonModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (query, req, res) => {
        try {
            console.log('Get Reason, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, reasonSchemas)
            const reasonModel = await getDBModel(DB, 'reason')
            return await reasonModel.find(query)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findReasonById = async (query, req, res) => {
        try {
            console.log('Get Reason, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, reasonSchemas)
            const reasonModel = await getDBModel(DB, 'reason')
            return await reasonModel.findOne(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (reasonCode, data, req, res) => {
        try {
            console.log('Update Reason, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, reasonSchemas)
            const reasonModel = await getDBModel(DB, 'reason')
            // find and update record in mongoDB
            return await reasonModel.findOneAndUpdate({ reasonCode: reasonCode }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAllActionReasons = async (req, res) => {
        try {
            console.log('Get All ActionReasons, Data ')
            const companyName = req.subdomain
            const DB = await switchDB(companyName, reasonSchemas)
            const reasonModel = await getDBModel(DB, 'reason')

            const pipeline = [
                {
                  $lookup: {
                    from: "action",
                    localField: "actionCode",
                    foreignField: "actionCode",
                    as: "action",
                  },
                },
                {
                  $unwind: {
                    path: "$action",
                  },
                },
                {
                  $project: {
                    _id: 0,
                    actionCode: 1,
                    actionName: "$action.actionName",
                    reasonCode: 1,
                    reasonName: 1,
                  },
                },
            ]
            return await reasonModel.aggregate(pipeline)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

}

module.exports = new ReasonService()