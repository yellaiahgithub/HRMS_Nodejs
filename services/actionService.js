const { switchDB, getDBModel, actionSchemas } = require("../middlewares/switchDB");

class ActionService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for action create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, actionSchemas)
            const actionModel = await getDBModel(DB, 'action')
            // add CompnayId
            let letCounts = "001"
            letCounts = await actionModel.countDocuments({ isActive : true})
            if(!letCounts) {
                letCounts = 1
            } else {
                letCounts++;
            } 
            let str = "" + letCounts
            let pad = "000"
            let ans = pad.substring(0, pad.length - str.length) + str
            data.actionId = (data?.actionName?.slice(0, 3)).toUpperCase() + "" + ans
            
            return actionModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    find = async (query, req, res) => {
        try {
            console.log('Get Action, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, actionSchemas)
            const actionModel = await getDBModel(DB, 'action')
            return await actionModel.find(query)
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    aggregation = async (pipeline, req) => {
        try {
            console.log('Get Action, Data By: ' + JSON.stringify(pipeline))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, actionSchemas)
            const actionModel = await getDBModel(DB, 'action')
            return await actionModel.aggregate(pipeline);
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update =  async (actionCode, data, req, res) => {
        try {
          console.log('Update Action, Data: ' + JSON.stringify(data))
          const companyName = req.subdomain
            const DB = await switchDB(companyName, actionSchemas)
            const actionModel = await getDBModel(DB, 'action')
          // find and update record in mongoDB
          return await actionModel.findOneAndUpdate({ actionCode: actionCode }, { $set: data }, { new: true, context: 'query', runValidators: true  })
        } catch (error) {
            console.log(error)
          throw new Error(error);
        }
      }

}

module.exports = new ActionService()