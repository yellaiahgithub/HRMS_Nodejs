const CompanyService = require('../services/companyService');
const {v4: uuidv4} = require('uuid');

class Company {
    constructor() { }

    createCompany = async (req, res, next) => {
        try {

            console.log('Create Company, Data By: ' + JSON.stringify(req.body))
            let data = req.body;
            data.uuid = uuidv4(); // unique id for Company
            // add CompnayId
            let letCounts = "001"
            letCounts = await CompanyService.getCompanyCounts(req);
            if(!letCounts) {
                 letCounts = 1
            } else {
                letCounts++;
            } 
            let str = "" + letCounts
            let pad = "000"
            let ans = pad.substring(0, pad.length - str.length) + str
            data.companyId = (data?.companyName?.slice(0, 3)).toUpperCase() + "" + ans
            // call method to service
            let resp = await CompanyService.create(data, req, res);

            return res.status(200).send(resp)
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findCompanyByIdOrName = async (req, res, next) => {
        try {
            console.log('Find Company, Data By: ' + JSON.stringify(req.query))
            if(!req.query.companyName && !req.query.uuid && !req.query.companyId) { throw new Error("No data found for search Company")}
            let query = {};
            if (req.query.companyName != undefined) {
                query =  {companyName:  { $regex : req.query.companyName, '$options' : 'i' } } 
            }
            if (req.query.uuid != undefined) {
                query.uuid = req.query.uuid;
            }
            if (req.query.companyId != undefined) {
                query =  {companyId:  { $regex : req.query.companyId, '$options' : 'i' } } 
            }

            let pipeline = [
                {
                  $match: {
                   ...query
                  }
                },
                {
                  $lookup: {
                    from: "customer",
                    localField: "customerUUID",
                    foreignField: "uuid",
                    as: "customer"
                  }
                },
              ];
            // call method to service
            let result = await CompanyService.findCompanyById(pipeline, req, res);

            if (!result) {
                return res.status(404).send('Company not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    findAll = async (req, res, next) => {
        try {
            console.log('Find Company, Data By: ' + JSON.stringify(req.params))
            let query = { isActive: true };
            // call method to service
            let pipeline = [
                {
                  $match: {
                   ...query
                  }
                },
                {
                  $lookup: {
                    from: "customer",
                    localField: "customerUUID",
                    foreignField: "uuid",
                    as: "customer"
                  }
                },
              ];
            // call method to service
            let result = await CompanyService.findAll(pipeline, req, res);

            if (!result) {
                return res.status(404).send('Company not found in the database')
            }
            return res.status(200).send(result);
        } catch (error) {
            console.error(error)
            res.status(400).send(error.message)
        }
    }

    updateCompany = async (req, res) => {
        try {
         
    
          if (Object.keys(req.body).length === 0) {
            return apiResponse.notFoundResponse(res, `No company data found for update`);
          }
          if (!req.params.companyId) return apiResponse.errorResponse(res, "Please send CompanyId");
    
          const data = req.body
          data.updatedAt = new Date()
          let companyId = req.params.companyId
          // call method to service
          let resp = await CompanyService.update(companyId, data, req, res);
          if (resp) {
            return  res.status(200).send(resp)
          } else {
            return res.status(400).send(`No company found for the companyId provided:${companyId}`);
          }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
      }
}

module.exports = new Company()