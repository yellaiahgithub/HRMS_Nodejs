const { switchDB, getDBModel, probationSetupSchema } = require("../middlewares/switchDB");

class ProbationSetupService {
    constructor() { }

    create = async (data, req, res) => {
        try {
            console.log('Data for probationSetup create', data);
            const companyName = req.subdomain
            const DB = await switchDB(companyName, probationSetupSchema)
            const probationSetupModel = await getDBModel(DB, 'probationSetup')
            // add ProbationSetupId
            return probationSetupModel.insertMany([data], { runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    
    findProbationSetupById = async (query, req, res) => {
        try {
            console.log('Get ProbationSetup, Data By: ' + JSON.stringify(query))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, probationSetupSchema)
            const probationSetupModel = await getDBModel(DB, 'probationSetup')
            return await probationSetupModel.findOne(query).lean();
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    update = async (data, req, res) => {
        try {
            console.log('Update ProbationSetup, Data: ' + JSON.stringify(data))
            const companyName = req.subdomain
            const DB = await switchDB(companyName, probationSetupSchema)
            const probationSetupModel = await getDBModel(DB, 'probationSetup')
            // find and update record in mongoDB
            return await probationSetupModel.findOneAndUpdate({ uuid: data.uuid }, { $set: data }, { new: true, context: 'query', runValidators: true })
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    getProbationDate = async (data, companyName) => {
    
        let date = null
        const DB = await switchDB(companyName, probationSetupSchema);
        const probationSetupModel = await getDBModel(DB, "probationSetup");
        const probationData = await probationSetupModel.findOne().lean(); 
  
        const probationPeriodObject = probationData?.probationPeriodArray.find(e => (e.probationPeriodFor == data?.jobType) ||  (e.probationPeriodFor == data?.probationPeriodFor) )
        if(probationPeriodObject) {
          let days = probationPeriodObject.probationPeriod
          let unit = probationPeriodObject.unit
          if(probationData?.hasExceptions) {
            const exceptionArrayForDepartment = probationData?.exceptionArray.find(e => 
              (e.criteria == "department" && e.value == data?.department)
              || (e.criteria == "location" && e.value == data?.location)
              || (e.criteria == "designation" && e.value == data?.designation)
              || (e.criteria == "jobType" && e.value == data?.jobType)
            )
            if(exceptionArrayForDepartment) {
              if(exceptionArrayForDepartment.priority < probationPeriodObject.priority ){
                days = exceptionArrayForDepartment.probationPeriod
                unit = exceptionArrayForDepartment.unit
              }
            }
          }
          if(unit == "Days") {
            let todayDate = new Date(data?.hireDate)
            date = new Date(todayDate.setDate(todayDate.getDate() +  Number(days)));
          } else if(unit == "Weeks"){
            let todayDate = new Date(data?.hireDate)
            date = new Date(todayDate.setDate(todayDate.getDate() +  Number(days * 7)));
          } else if(unit == "Months"){
            let todayDate = new Date(data?.hireDate)
            date = new Date(todayDate.setMonth(todayDate.getMonth() +  Number(days)));
          }
  
          return date;
        }
      }
}

    


module.exports = new ProbationSetupService()