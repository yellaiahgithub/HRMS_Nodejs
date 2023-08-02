const PasswordRuleService = require('../services/passwordRuleService.js');
const employeeService = require('../services/employeeService');
const AuthService = require('../services/authService');
const apiResponse = require("../helper/apiResponse");
const logger = require('../common/logging/services/logger').loggers.get('general')
const CryptoJS = require("crypto-js");

class LoginAdmin {
    constructor() { }
    
    createPasswordRule = async (req, res) => {
        try {
            console.log("Create PasswordRule, Data By: " + JSON.stringify(req.body));
            let data = req.body;
      
            // call method to service
            let resp = await PasswordRuleService.create(data, req);
      
            return res.status(200).send(resp);
          } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
          }
    }

    getPasswordRule = async (req, res, next) => {
        try {
            console.log('Find PasswordRule, Data By: ' + JSON.stringify(req.params))
            if (!req.params.companyUUID) return apiResponse.errorResponse(res, "Please send CompanyId");
            const query = {companyUUID : req.params.companyUUID}
            // call method to service
            let result = await  PasswordRuleService.get(query, req);

            if (!result) {
                return res.status(404).send('No Matching Results Found')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updatePasswordRule = async (req, res) => {
        try {
         
          if (!req.params.companyUUID) return apiResponse.errorResponse(res, "Please send CompanyId");

          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No Data found for update`);
          }
    
          const data = req.body
          data.updatedAt = new Date()
          let companyUUID = req.params.companyUUID
          // call method to service
          let resp = await PasswordRuleService.update(companyUUID, data, req);
          if (resp) {
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No company found for the companyUUID provided:${companyUUID}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }
}

module.exports = new LoginAdmin()