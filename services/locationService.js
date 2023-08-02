const { switchDB, getDBModel, locationSchemas, departmentSchema, uploadResultsSchema } = require('../middlewares/switchDB');
const autoNumberingService = require("../services/autoNumberingService");
const locationUtils = require("../utils/locationUtils");
var moment = require("moment"); // require


class LocationService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for location create', data);
            // add CompnayId
            let letCounts = "001"
            const companyName = req.subdomain
            const DB = await switchDB(companyName, locationSchemas)
            const locationModel = await getDBModel(DB, 'locations')
            letCounts = await locationModel.countDocuments({ isActive: true })
            if (!letCounts) {
                letCounts = 1
            } else {
                letCounts++;
            }
            let str = "" + letCounts
            let pad = "000"
            let ans = pad.substring(0, pad.length - str.length) + str
            data.locationId = (data?.locationName?.slice(0, 3)).toUpperCase() + "" + ans
            const nextSequence = await autoNumberingService.getNextSequence(
                { type: "LOC", req, res },
                req
              );
              if (nextSequence != null) {
                data.locationId = nextSequence;
              }
            const savedLocation = locationModel.insertMany([data], { runValidators: true })
            if (nextSequence != null) {
                const temp = await autoNumberingService.updateSequence(
                  { type: "LOC" },
                  req,
                  res
                );
            }
              return savedLocation;
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findAll = async (query, req, res) => {
        try {
            console.log('Get Location, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, locationSchemas)
            const locationModel = await getDBModel(DB, 'locations')
            return await locationModel.find(query).sort({ createdAt: -1 }).lean()
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    findWithProjection = async (query, req, res) => {
      try {
          console.log('Get Location, Data By: ' + JSON.stringify(query))
          const companyName = req.subdomain
          const DB = await switchDB(companyName, locationSchemas)
          const locationModel = await getDBModel(DB, 'locations')
          return await locationModel.find(query, {_id:0,
            uuid:1,
            locationId:1,
            locationName:1 }).lean();
      } catch (error) {
          console.log(error)
          throw new Error(error);
      }
  }

    findLocationById = async (query, req, res) => {
        try {
            console.log('Get Location, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, locationSchemas)
            const locationModel = await getDBModel(DB, 'locations')
            return await locationModel.findOne(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (locationId, data, req, res) => {
        try {
            console.log('Update Location, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, locationSchemas)
            const locationModel = await getDBModel(DB, 'locations')
            // find and update record in mongoDB
            return await locationModel.findOneAndUpdate({ locationId: locationId }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    createAllLocations = async (data, req, res) => {
        try {
          let errorList = [];
          let errorCount = 0;
          let sucessList = [];
          let sucessfullyAddedCount = 0;
          const allLocations = await this.findAll({},req,res);

          //getAllDepartments
          const departmentDB = await switchDB(req.subdomain, departmentSchema);
          const departmentModel = await getDBModel(departmentDB, "department");
          const allDepartments = await departmentModel.find({ status : true }).lean();    

          const LocationDB = await switchDB(req.subdomain, locationSchemas);
          const uploadResultsDB = await switchDB(
            req.subdomain,
            uploadResultsSchema
          );
          const locationModel = await getDBModel(LocationDB, "locations");
          const uploadResultsModel = await getDBModel(
            uploadResultsDB,
            "uploadResults"
          );
          let CSVHeader = [];
          if (!data?.isAutoGeneratedLocationId) {
            CSVHeader.push({ label: "Location_Id", key: "locationId" });
          }
          CSVHeader.push(
            { label: "Location_Name", key: "locationName" },
            { label: "Effective_Date(DD/MM/YYYY)", key: "effectiveDate" },
            { label: "City_Classification", key: "cityClassification" },
            { label: "Is_PTApplicable", key: "isPTApplicable" },
            { label: "Address", key: "address" },
            { label: "City", key: "city" },
            { label: "Country", key: "country" },
            { label: "State", key: "state" },
            { label: "Pin", key: "pin" },
            { label: "Is_Processing_Hub", key: "isProcessingHub" },
            { label: "Processing_Hub", key: "processingHub" },
            { label: "ESI_Applicable", key: "ESIApplicable" },
            { label: "ESI_Local_Office", key: "ESILocalOffice" },
            { label: "ESI_Account_Number", key: "ESIAccountNumber" },
            { label: "ESI_Start_Date(DD/MM/YYYY)", key: "ESIStartDate" },
            { label: "Company_TAN", key: "companyTAN" },
            { label: "TAN_Registered_Date(DD/MM/YYYY)", key: "TANRegisteredDate" },
            { label: "PF_Circle", key: "PFCircle" },
            { label: "Deductor_Type", key: "deductorType" },
            { label: "Holiday_Calendar_ID", key: "holidayCalendarID" },
            { label: "Time_Pattern_ID", key: "timePatternID" },
            { label: "Department_IDs", key: "departmentIDs" }
          );
          let uploadingData = {
            type: "Location",
            uploadedBy: "namya",
            fileName: data.fileName,
            errorFileName: data.fileName,
            status: "InProgress",
            uploadedData: data.data,
            createdAt: new Date(),
            csvHeader: CSVHeader,
          };
          const createUploadResult = await uploadResultsModel.insertMany(
            [uploadingData],
            {
              runValidators: true,
            }
          );
          for (let i = 0; i < data.data?.length > 0; i++) {
            const location = data.data[i];
            location.departmentList =
              location.departmentIDs?.length > 0
                ? location.departmentIDs.split(",")
                : [];
            console.log("processing the record: ", i + 1);
            const errors = await locationUtils.validateLocation(
              location,
              data.data,
              data?.isAutoGeneratedLocationId,
              allDepartments,
              allLocations,
              i
            );
            if (errors.length > 0) {
              const errorData = { ...location };
              errorData.errors = errors;
              errorList.push(errorData);
              errorCount++;
            } else {
              try {
                const locationData = {
                  ...location,
                  departmentIDs: location.departmentList,
                  status: true,
                };
                locationData.isPTApplicable =
                location.isPTApplicable?.toLowerCase() === "true".toLowerCase();
                locationData.ESIApplicable =
                location.ESIApplicable?.toLowerCase() === "true".toLowerCase();
                locationData.isProcessingHub =
                location.isProcessingHub?.toLowerCase() === "true".toLowerCase();
                locationData["effectiveDate"] = new Date(
                  moment(location.effectiveDate, "DD/MM/YYYY")
                );
                if (data?.isAutoGeneratedLocationId) {
                  const nextSequence = await autoNumberingService.getNextSequence(
                    { type: "LOC" },
                    req,
                    res
                  );
                  if (nextSequence != null) {
                    locationData.locationId = nextSequence;
                  }
                }
                const savedLocation = await locationModel.insertMany(
                  [locationData],
                  { runValidators: true }
                );
                if (savedLocation.length > 0) {
                  if (data?.isAutoGeneratedLocationId) {
                    const temp = await autoNumberingService.updateSequence(
                      { type: "LOC" },
                      req,
                      res
                    );
                  }
                  sucessList.push(locationData);
                  sucessfullyAddedCount++;
                }
              } catch (error) {
                const errorData = { ...location };
                errorData.errors = error.errors?.code?.properties?.message;
                errorList.push(errorData);
                errorCount++;
                console.log("error occured while saving record", i + 1);
                console.log("err", error);
              }
            }
            console.log("processed record", i + 1);
          }
          const updateUploadResult = await uploadResultsModel.updateOne(
            { _id: createUploadResult[0]._id },
            {
              $set: {
                status:
                  sucessfullyAddedCount == data.data.length ? "Sucess" : "Rejected",
                errorData: errorList,
                updatedAt: new Date(),
              },
            },
            { upsert: false, runValidators: true }
          );
          return {
            totalRecords: data.data.length,
            sucessfullyAdded: sucessfullyAddedCount,
            errorCount: errorCount,
            errorData: errorList,
            sucessData: sucessList,
            data: data.data,
          };
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      };
}

module.exports = new LocationService()