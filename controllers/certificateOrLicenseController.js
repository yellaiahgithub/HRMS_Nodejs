const { MAIL_NOTIFICATION_TYPE } = require('../constants/commonConstants');
const CertificateOrlicenseService = require('../services/certificateOrLicenseService');
const {v4: uuidv4} = require('uuid');
const { generateMail } = require('../utils/mailNotificationUtils');
const { switchDB, certificateOrlicenseSchema } = require('../middlewares/switchDB');


class CertificateOrlicense {
    constructor() { }

    findCertificateOrlicenseById = async (req, res, next) => {
        try {
            console.log('Find CertificateOrlicense, Data By: ' + JSON.stringify(req.params))
            if(!req.query.employeeUUID) { throw new Error("employeeUUID not found")}
            let query = {};
            query.employeeUUID  = req.query.employeeUUID
            const pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: 'employee',
                        let : { "uuid": "$employeeUUID" },
                        "pipeline": [
                            { "$match": { "$expr": { "$eq": ["$uuid", "$$uuid"] }}},
                            { "$project": {  _id:0, "id": 1, "uuid": 1}}
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
            let result = await CertificateOrlicenseService.aggregate(pipeline, req);

            if (!result || result.length == 0) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createCertificateOrlicense = async (req, res, next) => {
        try {
            console.log('Create CertificateOrlicense, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for certificateOrlicense
            // call method to service
            let resp = await CertificateOrlicenseService.create(data, req, res);

            //send Mail
            const inputObj=resp[0]
            const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
            if(resp[0].type.toLowerCase()==="Certificate".toLowerCase()) generateMail(MAIL_NOTIFICATION_TYPE.ADD_CERTIFICATE,body,req,inputObj)
            else generateMail(MAIL_NOTIFICATION_TYPE.ADD_LICENSE,body,req,inputObj)

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }


    updateCertificateOrlicense = async (req, res) => {
        try {
            if (!req.query.uuid) throw new Error("uuid is required.");
            let query = {}
            query.uuid = req.query.uuid 
            
          const data = req.body
          data.updatedAt = new Date()
          const companyName = req.subdomain
          const DB = await switchDB(companyName, certificateOrlicenseSchema)
          const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')

          // call method to service
          let resp = await CertificateOrlicenseService.update(query, data,  req, res);
          if (resp) {
            //send Mail
            const inputObj=await certificateOrlicenseModel.findOne({uuid:data.uuid})
            const body={benefactorUUIDs:[data.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
            if(inputObj.type.toLowerCase()==="Certificate".toLowerCase()) generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_CERTIFICATE,body,req,inputObj)
            else generateMail(MAIL_NOTIFICATION_TYPE.UPDATE_LICENSE,body,req,inputObj)
            
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No certificateOrlicense found for the certificateOrlicenseId provided:${certificateOrlicenseId}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }

      deleteCertificateOrlicenseDetail = async (req, res, next) => {
        try {
            
            if (!req.query.employeeUUID) throw new Error("employeeUUID is required.");
            if (!req.query.type) throw new Error("certificateType is required.");
            if (!req.query.nameOfTheCertificateOrLicense) throw new Error("nameOfTheCertificateOrLicense is required.");
            let query = {}
            query.employeeUUID = req.query.employeeUUID 
            query.type = req.query.type
            query.nameOfTheCertificateOrLicense = req.query.nameOfTheCertificateOrLicense 

            const companyName = req.subdomain
            const DB = await switchDB(companyName, certificateOrlicenseSchema)
            const certificateOrlicenseModel = await getDBModel(DB, 'certificateOrlicense')
            const inputObj=await certificateOrlicenseModel.findOne(query)

            // call method to service
            let result = await CertificateOrlicenseService.delete(query, req);

            if (!result) {
                return res.status(404).send('CertificateOrlicense Detail not found in the database')
            }
            else{
              const body={benefactorUUIDs:[inputObj.employeeUUID],initiatorUUID:res.locals.session?.userUUID}
              if(inputObj.type.toLowerCase()==="Certificate".toLowerCase()) generateMail(MAIL_NOTIFICATION_TYPE.DELETE_CERTIFICATE,body,req,inputObj)
              else generateMail(MAIL_NOTIFICATION_TYPE.DELETE_LICENSE,body,req,inputObj)
            }
            return res.status(200).send("Deleted");
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    createAllLicense = async (req, res, next) => {
        try {
          let data = req.body;
          if (data?.forValidationOnly == undefined) throw new Error("forValidationOnly is required.");
          if (data?.type == undefined) throw new Error("Please send the type : License / Certificate.");
          // call method to service
          let resp = await CertificateOrlicenseService.createAllLicenses(
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
            if (req.query?.type == undefined) throw new Error("Please send the type : License / Certificate.");
            const type=req.query.type;
            let CSVHeader = [];
            CSVHeader.push(
                { label: "Employee_Id", key: "Employee_Id" },
                { label: "Name_Of_The_"+type, key: "Name_Of_The_"+type },
                { label: "Effective_Date(DD/MM/YYYY)", key: "Effective_Date(DD/MM/YYYY)" },
                { label: "Level_Of_"+type, key: "level_Of_"+type },
                { label: "Validity", key: "Validity" },
                { label: "Date_Of_Issue(DD/MM/YYYY)", key: "Date_Of_Issue(DD/MM/YYYY)" },
                { label: "Validity_From(DD/MM/YYYY)", key: "Validity_From(DD/MM/YYYY)" },
                { label: "Validity_Until(DD/MM/YYYY)", key: "Validity_Until(DD/MM/YYYY)" },
                { label: "Issuing_Authority", key: "Issuing_Authority" },
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

module.exports = new CertificateOrlicense()