const { switchDB, getDBModel, moduleAccessSchema } = require("../middlewares/switchDB");
const conf = require("../conf/conf");
const {v4: uuidv4} = require('uuid');
class ModuleAccessService {
  constructor() { }

  create = async (dataArray, req, res) => {
    try {
      console.log("Data for moduleAccess create", dataArray);
      const companyName = conf.DB_NAME
      const DB = await switchDB(companyName, moduleAccessSchema)
      const moduleAccessModel = await getDBModel(DB, 'moduleAccess')
      // return await moduleAccessModel.insertMany([data], { runValidators: true });

      let createdArray = []
      for (let data of dataArray) {
        data.uuid = uuidv4();
        const obj =  await moduleAccessModel.insertMany([data], { runValidators: true });
        createdArray.push(obj[0]);
      }
     
      return createdArray;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  update = async (dataArray, req) => {
    try {
      console.log("Data for moduleAccess update", dataArray);
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, moduleAccessSchema)
      const moduleAccessModel = await getDBModel(companyDB, 'moduleAccess')
      let updatedArray = []
      for (const data of dataArray) {
        const obj =  await moduleAccessModel.updateOne(
          { name : data.name, companyId: data.companyId},
          { $set: data },
          { upsert: true },
         //{ runValidators: true },
        );
        updatedArray.push(obj);
      }
     
      return updatedArray;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (query, req, res) => {
    try {
      console.log("Get moduleAccess, Data By: " + JSON.stringify(query));
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, moduleAccessSchema)
      const moduleAccessModel = await getDBModel(companyDB, 'moduleAccess')
      return await moduleAccessModel.find(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };



  findModuleAccessBy = async (query, req) => {
    try {
      console.log("Get moduleAccess, Data By: " + JSON.stringify(query));
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, moduleAccessSchema)
      const moduleAccessModel = await getDBModel(companyDB, 'moduleAccess')
      return await moduleAccessModel.find(query, {_id:0, __v:0, createdAt:0, updatedAt:0, isActive:0}).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new ModuleAccessService();
