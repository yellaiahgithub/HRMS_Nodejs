const {
    switchDB,
    getDBModel,
    holidayCalendarConfigurationSchema,
    locationSchemas
  } = require("../middlewares/switchDB");
  const { v4: uuidv4 } = require("uuid");
  
  class HolidayCalendarConfigurationService {
    constructor() {}
  
    createHolidayCalendarConfiguration = async (data, req, res) => {
      const companyName = req.subdomain;
      const lDB = await switchDB(companyName, locationSchemas);
      const locationModel = await getDBModel(lDB, "locations");

      const location  = await locationModel.findOne({ locationId: data.locationId }, {_id:0, locationName :1}).lean();
      if(!location) {
        throw new Error(`Location does not exist` )
      }
      try {
        console.log("Data for holidayCalendarConfiguration create", data);
        
        const DB = await switchDB(companyName, holidayCalendarConfigurationSchema);
        const holidayModel = await getDBModel(DB, "holidayCalendarConfiguration");
        data.uuid = uuidv4();
        
       
        

        const savedHolidayCalendarConfiguration = await holidayModel.insertMany([data], {
          runValidators: true,
        });
        return savedHolidayCalendarConfiguration;
      } catch (error) {
        
        let errorMessage = ""
        if(error.message?.includes("expected `year` to be unique") 
        && error.message?.includes("expected `locationId` to be unique")
        && error.message?.includes("expected `name` to be unique")){
          errorMessage = `A Holiday Calendar has already been created for <<${data.year} >>, for <<${location.locationName} >> Location. You cannot create another Holiday Calendar for this location. Alternatively please try editing the same calendar if you need any changes to be made.`
        } else if(error.message?.includes("expected `year` to be unique") 
        && error.message?.includes("expected `locationId` to be unique")){
          errorMessage =`A Holiday Calendar has already been created for <<${data.year} >>, for <<${location.locationName} >> Location. You cannot create another Holiday Calendar for this location. Alternatively please try editing the same calendar if you need any changes to be made.`
        } else if(error.message?.includes("expected `year` to be unique") 
        && error.message?.includes("expected `name` to be unique")){
          errorMessage = `A Holiday Calendar has already been created for <<${data.name} >> and <<${data.year} >>, for <<${location.locationName} >> Location. You cannot create another Holiday Calendar for this location. Alternatively please try editing the same calendar if you need any changes to be made.`
        }

        if(error?.errmsg?.includes("E11000 duplicate key error")){
          errorMessage = `A Holiday Calendar has already been created for <<${data.name} >> and <<${data.year} >>, for <<${location.locationName} >> Location. You cannot create another Holiday Calendar for this location. Alternatively please try editing the same calendar if you need any changes to be made.`
        }
        console.log(errorMessage);
        if(errorMessage != "") throw new Error(errorMessage);
        throw new Error(error);
      }
    };
  
    findHolidayCalendarConfiguration = async (query, req) => {
      try {
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, holidayCalendarConfigurationSchema);
        const holidayModel = await getDBModel(DB, "holidayCalendarConfiguration");
        return await holidayModel.find(query).collation({locale: "en" }).sort({ name:1}).lean();
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };

    updateHolidayCalendarConfiguration = async (data, req) => {
      try {
        console.log("Data for HolidayCalendarConfiguration update", data);
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, holidayCalendarConfigurationSchema);
        const holidayConfigModel = await getDBModel(DB, "holidayCalendarConfiguration");
        return await holidayConfigModel.updateOne(
          { uuid: data.uuid },
          { $set: data },
          { upsert: false }
        );
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };

    aggregate = async (pipeline, req) => {
      try {
        console.log("Data for HolidayCalendarConfiguration update", pipeline);
        const companyName = req.subdomain;
        const DB = await switchDB(companyName, holidayCalendarConfigurationSchema);
        const holidayConfigModel = await getDBModel(DB, "holidayCalendarConfiguration");
        return await holidayConfigModel.aggregate(pipeline);
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }
    };
  }
  
  module.exports = new HolidayCalendarConfigurationService();
  