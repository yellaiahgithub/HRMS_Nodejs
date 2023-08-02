const EmergencyContactService = require('../services/emergencyContactService.js');
const {v4: uuidv4} = require('uuid');
const { generateMail } = require('../utils/mailNotificationUtils.js');
const { MAIL_NOTIFICATION_TYPE } = require('../constants/commonConstants.js');
const { switchDB,emergencyContactSchema } = require('../middlewares/switchDB.js');

class EmergencyContact {
    constructor() { }
    create = async (req, res, next) => {
        try {
            console.log('Create EmergencyContact, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for action
            // call method to service
            let resp = await EmergencyContactService.create(data, req, res);

            //send Mail
            const inputObj=resp[0]
            const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
            generateMail(MAIL_NOTIFICATION_TYPE.ADD_EMERGENCY_CONTACT,body,req,inputObj)
      
            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    deleteEmergencyContactById = async (req, res, next) => {
        try {
            if (!req.body.uuid) throw new Error("EmergencyContact id is required.");
            let query = {}
            query.uuid =  req.body.uuid 
            const body =  req?.body // for store history send reason and effectiveDate

            const companyName = req.subdomain
            const DB = await switchDB(companyName, emergencyContactSchema)
            const emergencyContactModel = await getDBModel(DB, 'emergencyContact')
            const inputObj=await emergencyContactModel.findOne(query)

            // call method to service
            let result = await EmergencyContactService.deleteEmergencyContact(query, body, req);

            if (!result) {
                return res.status(404).send('EmergencyContact not found in the database')
            }else{
              const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
              generateMail(MAIL_NOTIFICATION_TYPE.DELETE_EMERGENCY_CONTACT,body,req,inputObj)
        
            }
            return res.status(200).send("Deleted");
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updateEmergencyContactById = async (req, res, next) => {
        try {

            console.log('Update EmergencyContact, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            const companyName = req.subdomain
            const DB = await switchDB(companyName, emergencyContactSchema)
            const emergencyContactModel = await getDBModel(DB, 'emergencyContact')

            // call method to service
            let resp = await EmergencyContactService.updateEmergencyContact(data, req);
            if (resp?.matchedCount) {

              //trigger mail
              const inputObj=await emergencyContactModel.findOne({uuid:data.uuid})
              const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
              generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_EMERGENCY_CONTACT,body,req,inputObj)

              return  res.status(200).send(resp)
            } else {
              return res.status(400).send(`No EmergencyContact found for the provided:${req?.query}`);
            }
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findEmergencyContactByEmployeeId = async (req, res, next) => {
        try {
            if (!req.params.employeeUUID) throw new Error("Employee id is required.");
            let query = { employeeUUID: req.params.employeeUUID};
            // call method to service
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
                },
                {
                  $sort:{
                    "isPrimary":-1
                  }
                }

              ]
            let result = await EmergencyContactService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('EmergencyContact not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createAllEmergencyContact = async (req, res, next) => {
        try {
          let data = req.body;
          if (data?.forValidationOnly == undefined) throw new Error("forValidationOnly is required.");
          // call method to service
          let resp = await EmergencyContactService.createAllEmergencyContacts(
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
            let CSVHeader = [];
            CSVHeader.push(
              { label: "Employee_Id", key: "employeeId" },
              { label: "Contact_Name", key: "contactName" },
              { label: "Relationship", key: "relationship" },
              { label: "Phone_Number", key: "phoneNo" },
              { label: "Is_Primary", key: "isPrimary" },
              { label: "Address_Line_1", key: "addressLine1" },
              { label: "Address_Line_2", key: "addressLine2" },
              { label: "Country", key: "country" },
              { label: "State", key: "state" },
              { label: "City", key: "city" },
              { label: "PIN_Code", key: "pinCode" },
            );
          const data = {
            CSVHeader: CSVHeader
          };
          return res.status(200).send(data);
        } catch (error) {
          console.error(error);
          res.status(400).send(error.message);
        }
      };
}

module.exports = new EmergencyContact()