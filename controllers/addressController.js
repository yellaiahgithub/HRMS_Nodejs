const AddressService = require('../services/addressService');
const {v4: uuidv4} = require('uuid');
const apiResponse = require('../helper/apiResponse');
const { MAIL_NOTIFICATION_TYPE } = require('../constants/commonConstants');
const { generateMail } = require('../utils/mailNotificationUtils');
const { switchDB, addressSchema } = require('../middlewares/switchDB');

class Address {
    constructor() { }

    findAddressById = async (req, res, next) => {
        try {
            console.log('Find Address, Data By: ' + JSON.stringify(req.params))
            if(!req.params.employeeUUID) { throw new Error("No employeeUUID found for search address")}
            let query = {};
            
            if (req.params.employeeUUID != undefined) {
                query.employeeUUID  = req.params.employeeUUID
            }

            if(req.query.isPrimary != undefined) {
                query.isPrimary = req.query.isPrimary == "true" ? true : false;
            }
            const pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'employee',
                        let : { "id": "$employeeUUID" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$uuid", "$$id"] }}},
                            { "$project": {  _id:0, "id": 1}}
                          ],
                        as: 'employee',
                    }
                },
                {
                    $unwind : {
                        path:"$employee"
                    }
                }
            ]
            // call method to service
            let result = await AddressService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createAddress = async (req, res, next) => {
        try {

            console.log('Create Address, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for address
            // call method to service
            let resp = await AddressService.create(data, req, res);

            //sendMail
            const inputObj=resp[0];
            const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
            generateMail(MAIL_NOTIFICATION_TYPE.ADD_ADDRESS,body,req,inputObj)  
      
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updateAddress = async (req, res) => {
        try {
         
    
          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No address data found for update`);
          }
          if (!req.query.uuid) return apiResponse.errorResponse(res, "Please send uuid in query");
    
          const data = req.body
          data.updatedAt = new Date()
          let query = {};
                
          query.uuid  = req.query.uuid
          const DB = await switchDB(req.subdomain, addressSchema)
          const addressModel = await getDBModel(DB, 'address')

          // call method to service
          let resp = await AddressService.update(query, data, req, res);
          if (resp?.matchedCount) {
            //send Mail
            const inputObj=await addressModel.findOne({uuid:data.uuid})
            const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
            generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_ADDRESS,body,req,inputObj)  

            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(resp);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    }

    deleteAddress = async (req, res) => {
        try {
            console.log('Delete address by, Data : ' + JSON.stringify(req.query))
            if (!req.query.uuid) throw new Error("uuid is required.");
            let query = {}
            query.uuid = req.query.uuid

            const DB = await switchDB(req.subdomain, addressSchema)
            const addressModel = await getDBModel(DB, 'address')
            const inputObj=await addressModel.findOne(query)

            
            // call method to service
            let response = await AddressService.delete(query, req, res);
        
            if (response?.deletedCount == 0) {
                return apiResponse.validationErrorWithData(res, `No Address found for provided Details:${req.body.employeeUUID} + ${req.body.addressType}`)
            } else if (response == `Can't delete, this is a Primary Address`) {
                return apiResponse.validationErrorWithData(res, `Can't delete, this is a Primary Address`)
            }
            else{
              //send Mail
              const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
              generateMail(MAIL_NOTIFICATION_TYPE.DELETE_ADDRESS,body,req,inputObj)  
            }
            return apiResponse.successResponse(res, "Successfully deleted Address")
        
        } catch (error) {
            console.log(error)
            apiResponse.errorResponse(res, error.message)
        }
      }
      generateCSVHeader = async (req, res, next) => {
    try {
      let CSVHeader = [];
      CSVHeader.push(
        { label: "Employee_Id", key: "Employee_Id" },
        { label: "Address_Type", key: "Address_Type" },
        { label: "Effective_Date(DD/MM/YYYY)", key: "Effective_Date(DD/MM/YYYY)" },
        { label: "Country", key: "Country" },
        { label: "State", key: "State" },
        { label: "City", key: "City" },
        { label: "Pin_Code", key: "Pin_Code" },
        { label: "Address_Line_One", key: "Address_Line_One" },
        { label: "Address_Line_Two", key: "Address_Line_Two" },
        { label: "Address_Line_Three", key: "Address_Line_Three" },
        { label: "Is_Primary", key: "Is_Primary" }
      );
      const data = {
        CSVHeader: CSVHeader,
      };
      return res.status(200).send(data);
    } catch (error) {
      console.error(error);
      res.status(400).send(error.message);
    }
  };
  createAllEmployeeAddresses = async (req, res, next) => {
    try {
      let data = req.body;

      // call method to service
      let resp = await AddressService.createAllEmployeeAddresses(
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

}

module.exports = new Address()