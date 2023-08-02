const {
  switchDB,
  getDBModel,
  bankSchema,
} = require("../middlewares/switchDB");
class BankService {
  constructor() { }

  createBank = async (data, req, res) => {
    try {
      console.log("Data for bank create", data);
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, bankSchema);
      const bankModel = await getDBModel(DB, "bank");

      // add bankId
      let letCounts = "001"
      letCounts = await bankModel.countDocuments({ isActive: true })
      if (!letCounts) {
        letCounts = 1
      } else {
        letCounts++;
      }
      let str = "" + letCounts
      let pad = "000"
      let ans = pad.substring(0, pad.length - str.length) + str
      data.bankId = (data?.name?.slice(0, 3)).toUpperCase() + "" + ans
      const savedBank = await bankModel.insertMany([data], {
        runValidators: true,
      });

      return savedBank;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findAll = async (req) => {
    try {
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, bankSchema);
      const bankModel = await getDBModel(DB, "bank");
      return await bankModel.find();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findBank = async (query, req, res) => {
    try {
      console.log("Get bank, Data By: " + JSON.stringify(query));
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, bankSchema);
      const bankModel = await getDBModel(DB, "bank");
      return await bankModel.find(query).lean();
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  findBankWithBranches = async ( req, res) => {
    try {
      console.log("Get All Banks with Branches");
      let pipeline = [
      {
        $lookup: {
          from: "bankBranch",
          localField: "uuid",
          foreignField: "bankUUID",
          as: "branches",
        },
      },{
        $project: {
          _id:1,
          uuid:1,
          bankId:1,
          name:1,
          isActive:1,
          createdAt:1,
          updatedAt:1,
          branches:"$branches"
        }
      }
    ];
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, bankSchema);
      const bankModel = await getDBModel(DB, "bank");
      return await bankModel.aggregate(pipeline);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };
}

module.exports = new BankService();
