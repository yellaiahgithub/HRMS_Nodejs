const {switchDB, getDBModel, userIdSetupSchema} = require("../middlewares/switchDB");

class UserIdService {
  constructor() {}

  create = async (data, req) => {
    try {
      console.log("Data for userid create", data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, userIdSetupSchema)
      const useridModel = await getDBModel(DB, 'userIdSetup')
      return await useridModel.insertMany([data], { runValidators: true });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  update = async (data, req) => {
    try {
      console.log("Data for userid update", data);
      const companyName = req.subdomain
      const DB = await switchDB(companyName, userIdSetupSchema)
      const useridModel = await getDBModel(DB, 'userIdSetup')
      return await useridModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: true },
        // { runValidators: true },
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  aggregate = async (pipeline, req) => {
    try {
      console.log("Get userid, Data By: " + JSON.stringify(pipeline));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, userIdSetupSchema)
      const useridModel = await getDBModel(DB, 'userIdSetup')
      return await useridModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (query, req) => {
    try {
      console.log("Get userid, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, userIdSetupSchema)
      const useridModel = await getDBModel(DB, 'userIdSetup')
      return await useridModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findUserIdById = async (query, req) => {
    try {
      console.log("Get userid, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain
      const DB = await switchDB(companyName, userIdSetupSchema)
      const useridModel = await getDBModel(DB, 'userIdSetup')
      return await useridModel.findOne(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  // delete userIds by employeeUUID
  delete = async (employeeUUID, req) => {
    try {
      console.log('Delete UserId, Data: ' + JSON.stringify(employeeUUID))
      const companyName = req.subdomain
      const DB = await switchDB(companyName, userIdSetupSchema)
      const useridModel = await getDBModel(DB, 'userIdSetup')
      // find and update record in mongoDB
      return await useridModel.deleteOne({ employeeUUID: employeeUUID })
     } catch (error) {
      console.log(error)
      throw new Error(error);
    }
  }
}

module.exports = new UserIdService();
