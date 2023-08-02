const LocationService = require('../services/locationService');
const {v4: uuidv4} = require('uuid');
const autoNumberingService = require("../services/autoNumberingService");

class Location {
    constructor() { }

    findLocationById = async (req, res, next) => {
        try {
            console.log('Find Location, Data By: ' + JSON.stringify(req.params))
            if(!req.query.locationName && !req.query.locationId) { throw new Error("No data found for search location")}
            let query = {};
            if (req.query.locationName != undefined) {
                query =  {locationName:  { $regex : req.query.locationName, '$options' : 'i' } } 
            }
            if (req.query.locationId != undefined) {
                query =  {locationId:  { $regex : req.query.locationId, '$options' : 'i' } } 
            }
            // call method to service
            let result = await LocationService.findLocationById(query, req, res);

            if (!result) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find Location, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let result = await LocationService.findAll(query, req, res);

            if (!result) {
                return res.status(404).send('location not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAllLite = async (req, res, next) => {
      try {
          console.log('Find Location lite, Data By: ' + JSON.stringify(req.params))
          let query = { isActive: true };
          // call method to service
         
          let result = await LocationService.findWithProjection(query, req, res);

          if (!result) {
              return res.status(404).send('location not found in the database')
          }
          return res.status(200).send(result);
      } catch (error) {
          console.error(error)
          res.status(400).send(error.message)
      }
  }

    createLocation = async (req, res, next) => {
        try {

            console.log('Create Location, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for location
            
            // call method to service
            let resp = await LocationService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }


    updateLocation = async (req, res) => {
        try {
         
    
          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No location data found for update`);
          }
          if (!req.params.locationId) return apiResponse.errorResponse(res, "Please send LocationId");
    
          const data = req.body
          data.updatedAt = new Date()
          let locationId = req.params.locationId
          // call method to service
          let resp = await LocationService.update(locationId, data, req, res);
          if (resp) {
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No location found for the locationId provided:${locationId}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }
      createAllLocations = async (req, res, next) => {
        try {
          let data = req.body;
    
          // call method to service
          let resp = await LocationService.createAllLocations(
            data,
            req,
            res
          );
    
          return res.status(200).send(resp);
        } catch (error) {
          console.error(error);
          res.status(400).send(error.message);
        }
      };
      generateCSVHeader = async (req, res, next) => {
        try {
          const autoNumberingData =
            await autoNumberingService.getAutoNumberingByType(
              { type: "LOC" },
              req,
              res
            );
          let CSVHeader = [];
          if (!autoNumberingData?.autoGenerated) {
            CSVHeader.push({ label: "Location_Id", key: "Location_Id" });
          }
          CSVHeader.push(
            { label: "Location_Name", key: "Location_Name" },
            { label: "Effective_Date(DD/MM/YYYY)", key: "Effective_Date(DD/MM/YYYY)" },
            { label: "City_Classification", key: "City_Classification" },
            { label: "Is_PTApplicable", key: "Is_PTApplicable" },
            { label: "Address", key: "Address" },
            { label: "City", key: "City" },
            { label: "Country", key: "Country" },
            { label: "State", key: "State" },
            { label: "Pin", key: "Pin" },
            { label: "Is_Processing_Hub", key: "Is_Processing_Hub" },
            { label: "Processing_Hub", key: "Processing_Hub" },
            { label: "ESI_Applicable", key: "ESI_Applicable" },
            { label: "ESI_Local_Office", key: "ESI_Local_Office" },
            { label: "ESI_Account_Number", key: "ESI_Account_Number" },
            { label: "ESI_Start_Date(DD/MM/YYYY)", key: "ESI_Start_Date(DD/MM/YYYY)" },
            { label: "Company_TAN", key: "Company_TAN" },
            { label: "TAN_Registered_Date(DD/MM/YYYY)", key: "TAN_Registered_Date(DD/MM/YYYY)" },
            { label: "PF_Circle", key: "PF_Circle" },
            { label: "Deductor_Type", key: "Deductor_Type" },
            { label: "Holiday_Calendar_ID", key: "Holiday_Calendar_ID" },
            { label: "Time_Pattern_ID", key: "Time_Pattern_ID" },
            { label: "Department_IDs", key: "Department_IDs" }
          );
          const data = {
            CSVHeader: CSVHeader,
            autoNumberingData: autoNumberingData,
          };
          return res.status(200).send(data);
        } catch (error) {
          console.error(error);
          res.status(400).send(error.message);
        }
      };
    
    
}

module.exports = new Location()