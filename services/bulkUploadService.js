const {
    switchDB,
    getDBModel,
    actionSchemas,
} = require("../middlewares/switchDB");


class BulkUploadService {
    constructor() { }
  
    aggregate = async (query, req) => {
        try {
            console.log("Get bulkUpload, Data By: " + JSON.stringify(query));
            const companyName = req.subdomain;
            const DB = await switchDB(companyName, actionSchemas);
            const model = await getDBModel(DB, "action");
            return await model.aggregate(query);
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };
}

module.exports = new BulkUploadService();
