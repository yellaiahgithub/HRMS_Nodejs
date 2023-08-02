// const bcrypt = require('bcrypt')
const { IsValidString, IsEmptyObject } = require('../../../helper/helperFunctions')
const { BadRequestError, NotFoundError } = require('../../../middlewares/errorHandler/clientError')
const logger = require('../../logging/services/logger').loggers.get('general')
const apiResponse = require('../../../helper/apiResponse')
const CryptoJS = require("crypto-js");
const {switchDB, getDBModel, adminSchema, employeeSchema, companySchemas, moduleAccessSchema} = require("../../../middlewares/switchDB");
const CountryService = require("../../../services/countryService"); 
const { config } = require('winston')
const conf = require("../../../conf/conf");
const EmployeeService = require("../../../services/employeeService");

/**
 * Local Strategy Middleware
 *
 * @method localStrategy
 * @param {string} req request object
 * @param {object} res response object
 * @param {object} next middleware function
 */

const localStrategy = async (req, res, next) => {
  // destructure username and password from request body
  const { username, password } = req.body
  // return if either username or password are invalid.
  if (!IsValidString(username)) {
    next(new BadRequestError('Missing username.'))
  }
  if (!IsValidString(password)) {
    next(new BadRequestError('Missing password.'))
  }
  try {
    // Check Company exist or not by subdomain
    const checkDb = await switchDB("HRMS", companySchemas)
    const companyModel = await getDBModel(checkDb, 'company')
    const companyExist = await companyModel.findOne({subdomainName: req.subdomain}).lean()
    let modules = []
    let countries = [];
    if(!companyExist) {
      return apiResponse.unauthorizedResponse(res, 'Company not exist - ' + req.subdomain)
    } else {
      const checkDb = await switchDB("HRMS", moduleAccessSchema)
      const moduleAccessModel = await getDBModel(checkDb, 'moduleAccess')
      modules = await moduleAccessModel.find({companyId: companyExist.companyId}, {_id:0, __v:0, createdAt:0, updatedAt:0, isActive:0}).lean();
      
      countries = await CountryService.findAll();
    }

    // query user from DB
  
    const newDB = await switchDB(conf.DB_NAME, adminSchema)
    const adminModel = await getDBModel(newDB, 'admin')
    let user = [] 
    user = await adminModel.aggregate([
      {
        $match: {
          username: username
        }
      },
      {
        $project:{
          username:1,
          password:1,
          uuid:1,
          //email:1,
          //admin:1,
          isActive:1
        }
      }
    ]);
    
    if(!user.length) {
       const newDB = await switchDB(req.subdomain, employeeSchema)
       const employeeModel = await getDBModel(newDB, 'employee')
      user = await employeeModel.aggregate([
        {
          $match: {
            userId: username
          }
        },
        {
          $project:{
            firstName:1,
            lastName: 1,
            middleName:1,
            password:1,
            uuid:1,
            designation:1,
            //admin:1,
            isActive:1,
            incorrectPasswordAttempts:1,
            isLocked:1
          }
        }
      ]);
      if(user && user.length > 0) {
        user[0].userType = "Employee"
      }
    } else {
      user[0].userType = "Admin"
    }
    
    user = user && user.length > 0 ? user[0] : null;

    // return if username was not found
    if (IsEmptyObject(user)) {
      //return next(new NotFoundError('Username not found in the database.'))
      return apiResponse.unauthorizedResponse(res, 'Invalid username. Please enter credentials Again')
    }
    
    // destructure hash
    const { password: passwordHash } = user
    // return if no hash
    if (!IsValidString(passwordHash)) {
     // return next(new NotFoundError('A password has not been set for this account.'))
      return apiResponse.unauthorizedResponse(res, 'A password has not been set for this account.')
    }

    // return if user isActive false
    if(!user?.isActive) {
      return apiResponse.unauthorizedResponse(res, 'User Has Been Disabled Contact Admin')
    }
    if(user?.isLocked) {
      return apiResponse.unauthorizedResponse(res, 'You have locked out your account. Contact your Administrator for further help.')
    }

    // decrypt incoming password
    // var UserPass = CryptoJS.AES.decrypt(password, 'hrms');
    UserPass = password

    // // // decrypt db password
    var dbPass = CryptoJS.AES.decrypt(passwordHash, 'hrms');
    dbPass = dbPass.toString(CryptoJS.enc.Utf8);

    const match = dbPass === UserPass
    //const match = user?.password === password
    // const match = await bcrypt.compare(password, passwordHash);
    // return if passwords match
    if (match) {
      let userDetails = {
        userId: user.uuid,
        username: user?.username,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        isAdmin : (user.userType  == 'Admin' || user.userType  ==  'Employee') ?  true :  false
        //passwordReset : user.passwordReset,
        //userRole: user.userRole
      }
      res.locals.userDetails = userDetails
      res.locals.companyDetails = companyExist
      res.locals.modules = modules ?? []
      res.locals.countries = countries
      // req.session.userDetails = userDetails
      // req.session.save();
      if(user?.incorrectPasswordAttempts>0){
        let data={uuid:user?.uuid,incorrectPasswordAttempts:0}
        await EmployeeService.updateEmployee(data,req)
      }
      return next()
    }
    else{
      let incorrectPasswordAttempts=(user?.incorrectPasswordAttempts?user?.incorrectPasswordAttempts:0)+1;
      //update employee incorrectPasswordAttempts and make employee locked if count is 3
       let data={uuid:user?.uuid,incorrectPasswordAttempts:incorrectPasswordAttempts}
       if(incorrectPasswordAttempts>=3){
        data.isLocked=true;
       }
       const updateResponse=await EmployeeService.updateEmployee(data,req)
      if(incorrectPasswordAttempts>=3) {
        return apiResponse.unauthorizedResponse(res, 'You have locked out your account. Contact your Administrator for further help.')
      }
    }
    // return if no match
    // return next(new BadRequestError('Invalid password.'))

    return apiResponse.unauthorizedResponse(res, 'Password that you have entered is incorrect. Please try again with the correct password or try using the “Forgot Password” option.')
   
  } catch (error) {
    logger.error(`Local Auth Strategy Failed: ${error}`)
    //next(new BadRequestError('Failed to authenticate user.'))
    return apiResponse.unauthorizedResponse(res, 'Failed to authenticate user.')
  }
}

module.exports = localStrategy
