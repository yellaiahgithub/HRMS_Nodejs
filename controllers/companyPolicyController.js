const CompanyPolicyService = require('../services/companyPolicyService.js');
const {v4: uuidv4} = require('uuid');
const StorageService = require("../services/StorageService");

class CompanyPolicy {
    constructor() { }

    createCompanyPolicy = async (req, res, next) => {
        try {

            console.log('Create CompanyPolicy, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for CompanyPolicy
            // call method to service
            let resp = await CompanyPolicyService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find CompanyPolicy, Data By: ' + JSON.stringify(req.params))
            // call method to service
            let result = await CompanyPolicyService.findAll(req);

            if (!result) {
                return res.status(404).send('Policies not found in the database')
            }
            for(let index=0;index<result.length;index++){
                const companyPolicy=result[index];
                if(companyPolicy.upload){
                  let storageResp = await StorageService.get(companyPolicy.upload.filePath);
                  if (typeof storageResp != 'string') {
                    let buf = Buffer.from(storageResp.Body);
                    let base64 = buf.toString("base64");
                    let pdfSrc64 = 'data:application/pdf;base64,' + base64;
                    companyPolicy.pdfFile=pdfSrc64
                  }  
                }
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }
}

module.exports = new CompanyPolicy()