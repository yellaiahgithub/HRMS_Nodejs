const { switchDB, getDBModel, customerSchema } = require("../middlewares/switchDB");
const conf = require("../conf/conf");
class CustomerService {
  constructor() { }

  create = async (data, req, res) => {
    try {
      console.log("Data for customer create", data);
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, customerSchema)
      const customerModel = await getDBModel(companyDB, 'customer')
      return await customerModel.insertMany([data], { runValidators: true });
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  update = async (data, req, res) => {
    try {
      console.log("Data for customer update", data);
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, customerSchema)
      const customerModel = await getDBModel(companyDB, 'customer')
      return await customerModel.updateOne(
        { uuid: data.uuid },
        { $set: data },
        { upsert: false, runValidators: true },
        // { runValidators: true },
      );
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (query, req, res) => {
    try {
      console.log("Get customer, Data By: " + JSON.stringify(query));
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, customerSchema)
      const customerModel = await getDBModel(companyDB, 'customer')
      return await customerModel.find(query);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findCustomerById = async (query, req, res) => {
    try {
      console.log("Get customer, Data By: " + JSON.stringify(query));
      const companyName = conf.DB_NAME
      const companyDB = await switchDB(companyName, customerSchema)
      const customerModel = await getDBModel(companyDB, 'customer')
      return await customerModel.findOne(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new CustomerService();
