const { sendMail } = require('../helper/SendMail')
const { switchDB, getDBModel, employeeSchema, employeeEmailSchema, resetPasswordToken } = require('../middlewares/switchDB');
const logger = require('../common/logging/services/logger').loggers.get('general')
const employeeService = require('../services/employeeService');
const companyService = require('../services/companyService');
const apiResponse = require("../helper/apiResponse");
const CryptoJS = require("crypto-js");
const PasswordRuleService = require('../services/passwordRuleService');
const { v4: uuidv4 } = require("uuid");
const config = require('../config/default.json');
const { MAIL_NOTIFICATION_TYPE } = require('../constants/commonConstants');
const { generateMail } = require('../utils/mailNotificationUtils');

class AuthService {
  constructor() { }

  resetPassword = async (data, req, res) => {
    try {
      logger.info('Update user password: ' + JSON.stringify(req.data))
      let pwd;
      //user verfification
      let existingUser = await employeeService.findOneEmployee({ uuid: data.uuid }, req)
      if (!existingUser) { apiResponse.errorResponse(res, "Invalid User.") }

      // const companyData = await companyService.findByQuery({ subdomainName: req.subdomain })
      // if (companyData) {
        const companyPasswordRule = await PasswordRuleService.get({}, req)
        // auto generated password

        if (data?.password && !data?.autoGeneratedPassword && companyPasswordRule) {
          pwd=data.password;
          // check if company have repetitiveRule 
          if (companyPasswordRule?.repetitiveRule && companyPasswordRule?.repetitiveRule?.count && companyPasswordRule?.repetitiveRule?.status) {
            let newPass = data.password
            if (existingUser.previousPasswords && existingUser?.previousPasswords?.length > 0) {
              // get last passwords from previousPassword for checking repetitiveRule count
              const tempArray  = existingUser.previousPasswords.slice(-companyPasswordRule?.repetitiveRule?.count)
              if (tempArray && tempArray?.length > 0) {
                tempArray?.forEach(element => {
                  if(element){
                    let prePass = CryptoJS.AES.decrypt(element, 'hrms');
                    prePass = prePass.toString(CryptoJS.enc.Utf8);
                    if (prePass == newPass) { throw new Error(`You can't use your last ` + companyPasswordRule?.repetitiveRule?.count + ` passwords`) }
                  }
                });
              }
            }
          }
          if (companyPasswordRule?.lengthRule) {
            if (companyPasswordRule?.lengthRule?.status 
                && data.password?.length < companyPasswordRule?.lengthRule?.minimum ) {
              throw new Error(`Your Password should contain at least ${companyPasswordRule?.lengthRule?.minimum} characters.`)
            }

            if (companyPasswordRule?.lengthRule?.status 
              && data.password?.length > companyPasswordRule?.lengthRule?.maximum ) {
              throw new Error(`Your Password should contain Maximum ${companyPasswordRule.lengthRule.maximum} characters.`)
            }
          }
          if (companyPasswordRule?.containsRule && companyPasswordRule?.containsRule?.length > 0) {
            let upper = 0, lower = 0, number = 0, special = 0;
            const str = data.password
            for (let i = 0; i <  str?.length; i++)
            {
                if (str[i] >= 'A' && str[i] <= 'Z')
                  upper++;
              else if (str[i] >= 'a' && str[i] <= 'z')
                  lower++;
              else if (str[i]>= '0' && str[i]<= '9')
                  number++;
              else
                  special++;
            }
            companyPasswordRule?.containsRule.forEach(rule => {
              if(rule?.status && rule.type == 'Special Character'){
                if(rule?.minOrMax == 'Minimum') {
                   if(special < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Special characters`); }
                }
                if(rule?.minOrMax == 'Maximum') {
                  if(special < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Special characters`); }
                }
              }
              if(rule?.status && rule.type == 'Upper Case'){
                if(rule?.minOrMax == 'Minimum') {
                  if(upper < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Upper Case`); }
                }
                if(rule?.minOrMax == 'Maximum') {
                  if(upper < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Upper Case`); }
                }
              }
              if(rule?.status && rule.type == 'Lower Case'){
                if(rule?.minOrMax == 'Minimum') {
                  if(lower < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Lower Case`); }
                }
                if(rule?.minOrMax == 'Maximum') {
                  if(lower < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Lower Case`); }
                }
              }
            })
            
            
          }

          console.log("entered Password" , data.password)
          data.password = CryptoJS.AES.encrypt(data.password, "hrms").toString().split("=")[0]
        } else if (companyPasswordRule) {
          const autoGeneratedPass = this.generatePassword(companyPasswordRule)
          pwd=autoGeneratedPass
          console.log("Auto Generated Password", autoGeneratedPass)
          if (autoGeneratedPass) {
            // send mail password reset link
            try {
              await sendMail({
                to: [data?.email ? data?.email : existingUser.email],
                subject: "Password Reset",
                template: autoGeneratedPass //`<h3>Hi ${existingUser.firstName} ${existingUser.lastName},</h3><p>Your new password</p><p>${autoGeneratedPass}</p>`
              })

            } catch (error) {
              console.error(error.message)
            }
            console.log("autoGeneratedPass new Password" , autoGeneratedPass)
            data.password = CryptoJS.AES.encrypt(autoGeneratedPass, "hrms").toString().split("=")[0]

          }
        } else {
          let mask = '';
          let newPassword = '';
          const chars = '#aA';
          if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
          if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          if (chars.indexOf('#') > -1) mask += '0123456789';
          //const result = '';
          for (let i = 8; i > 0; --i) newPassword += mask[Math.floor(Math.random() * mask.length)];

          //function for password encryption
          const passStr = newPassword
          pwd=passStr;
          console.log("new Password" , passStr)
          data.password = CryptoJS.AES.encrypt(passStr, "hrms").toString().split("=")[0]

        }

      //}
      if (!existingUser?.previousPasswords) {
        existingUser.previousPasswords = []
      }
      let result = {}
      if(existingUser.password) {
        existingUser["previousPasswords"].push(existingUser.password)
        const previousPasswords = existingUser["previousPasswords"];
        result = await this.updatePassword(existingUser.uuid, { password: data.password, previousPasswords: previousPasswords }, req);
      } else {
        result = await this.updatePassword(existingUser.uuid, { password: data.password }, req);
      }
      const inputObj={password:pwd}
      const obj={benefactorUUIDs:[data.uuid],initiatorUUID:res.locals.session?.userUUID}
      generateMail(MAIL_NOTIFICATION_TYPE.RESET_PASSWORD_BY_ADMIN,obj,req,inputObj)
      if (result) {
        return result
      } else {
        // throw new Error("Invalid security answer.");
        apiResponse.errorResponse(res, "Invalid token.")
      }
      //}
    } catch (error) {
      logger.error(error)
      throw new Error(error);
    }
  }
  
  // API calling from forgot password page- reset password by token - "resetpasswordtokenUUID"
  resetPasswordByToken = async (data, req, res) => {
    try {
      logger.info('Update user password: ' + JSON.stringify(req.body))
      let pwd;
      
      const companyName = req.subdomain
      const rDB = await switchDB(companyName, resetPasswordToken)
      const rpModel = await getDBModel(rDB, 'resetPasswordToken')

      const resetPasswordTokensObj = await rpModel.findOne({token: req.body.resetpasswordtokenUUID, isExpired : false }).lean()
      if(!resetPasswordTokensObj && !resetPasswordTokensObj?.userUUID)  {throw new Error('Resetpasswordtoken is invalide or expired')};
      //user verfification
      let existingUser = await employeeService.findOneEmployee({ uuid: resetPasswordTokensObj?.userUUID }, req)
      if (!existingUser) { apiResponse.errorResponse(res, "Invalid User.") }

      // const companyData = await companyService.findByQuery({ subdomainName: req.subdomain })
      // if (companyData) {
        const companyPasswordRule = await PasswordRuleService.get({}, req)
        // auto generated password

        if (data?.password && companyPasswordRule) {
          // check if company have repetitiveRule 
          if (companyPasswordRule?.repetitiveRule && companyPasswordRule?.repetitiveRule?.count && companyPasswordRule?.repetitiveRule?.status) {
            let newPass = data.password
            if (existingUser.previousPasswords && existingUser?.previousPasswords?.length > 0) {
              // get last passwords from previousPassword for checking repetitiveRule count
              const tempArray  = existingUser.previousPasswords.slice(-companyPasswordRule?.repetitiveRule?.count)
              if (tempArray && tempArray?.length > 0) {
                tempArray?.forEach(element => {
                  if(element){
                    let prePass = CryptoJS.AES.decrypt(element, 'hrms');
                    prePass = prePass.toString(CryptoJS.enc.Utf8);
                    if (prePass == newPass) { throw new Error(`You can't use your last ` + companyPasswordRule?.repetitiveRule?.count + ` passwords`) }
                  }
                });
              }
            }
          }
          if (companyPasswordRule?.lengthRule) {
            if (companyPasswordRule?.lengthRule?.status 
                && data.password?.length < companyPasswordRule?.lengthRule?.minimum ) {
              throw new Error(`Your Password should contain at least ${companyPasswordRule?.lengthRule?.minimum} characters.`)
            }

            if (companyPasswordRule?.lengthRule?.status 
              && data.password?.length > companyPasswordRule?.lengthRule?.maximum ) {
              throw new Error(`Your Password should contain Maximum ${companyPasswordRule.lengthRule.maximum} characters.`)
            }
          }
          if (companyPasswordRule?.containsRule && companyPasswordRule?.containsRule?.length > 0) {
            let upper = 0, lower = 0, number = 0, special = 0;
            const str = data.password
            for (let i = 0; i <  str?.length; i++)
            {
                if (str[i] >= 'A' && str[i] <= 'Z')
                  upper++;
              else if (str[i] >= 'a' && str[i] <= 'z')
                  lower++;
              else if (str[i]>= '0' && str[i]<= '9')
                  number++;
              else
                  special++;
            }
            companyPasswordRule?.containsRule.forEach(rule => {
              if(rule?.status && rule.type == 'Special Character'){
                if(rule?.minOrMax == 'Minimum') {
                   if(special < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Special characters`); }
                }
                if(rule?.minOrMax == 'Maximum') {
                  if(special < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Special characters`); }
                }
              }
              if(rule?.status && rule.type == 'Upper Case'){
                if(rule?.minOrMax == 'Minimum') {
                  if(upper < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Upper Case`); }
                }
                if(rule?.minOrMax == 'Maximum') {
                  if(upper < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Upper Case`); }
                }
              }
              if(rule?.status && rule.type == 'Lower Case'){
                if(rule?.minOrMax == 'Minimum') {
                  if(lower < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Lower Case`); }
                }
                if(rule?.minOrMax == 'Maximum') {
                  if(lower < rule?.length) { throw new Error(`In your Password must have ${rule?.length} Lower Case`); }
                }
              }
            })
          }

          console.log("entered Password" , data.password)
          pwd=data.password
          data.password = CryptoJS.AES.encrypt(data.password, "hrms").toString().split("=")[0]
        }
      
      if (!existingUser?.previousPasswords) {
        existingUser.previousPasswords = []
      }

      existingUser["previousPasswords"].push(existingUser.password)
      const previousPasswords = existingUser["previousPasswords"];
          
      let result = await this.updatePassword(resetPasswordTokensObj?.userUUID, { password: data.password, previousPasswords: previousPasswords }, req);
      if (result?.modifiedCount > 0) {

        //send mail
        const inputObj={password:pwd}
        const obj={benefactorUUIDs:[userUUID],initiatorUUID:res.locals.session?.userUUID}
        generateMail(MAIL_NOTIFICATION_TYPE.RESET_PASSWORD_BY_SELF,obj,req,inputObj)
  
       // update isExpired true after updateing new password in employee collection
       const updateRPT = await rpModel.updateOne({token : resetPasswordTokensObj.token} , {isExpired: true})
        return  result;
      } else {
          apiResponse.errorResponse(res, "User not found");
      }
    } catch (error) {
      logger.error(error)
      throw new Error(error);
    }
  }


  generatePassword(companyPasswordRule) {
    const maxPasswordlength = companyPasswordRule?.lengthRule?.maximum;

    let numberChars = "0123456789";
    let upperChars = ""
    let lowerChars = ""
    let specialChars = "";

    let upperCharsMax = 0;
    let lowerCharsMax = 0
    let specialCharsMax = 0

    companyPasswordRule?.containsRule.forEach(element => {
      if (element?.type == "Upper Case" && element.status == true) {
        upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        upperCharsMax = element?.length
      }
      if (element?.type == "Lower Case" && element.status == true) {
        lowerChars = "abcdefghiklmnopqrstuvwxyz"
        lowerCharsMax = element?.length
      }
      if (element?.type == "Special Character" && element.status == true) {
        specialChars = "~!@-#$"
        specialCharsMax = element?.length
      }
    });



    let allChars = numberChars + upperChars + lowerChars + specialChars;
    let randPasswordArray = Array(maxPasswordlength);
    randPasswordArray[0] = numberChars;
    for (let i = upperCharsMax; i > 0; i--) {
      let char = upperChars ? upperChars : numberChars
      randPasswordArray.splice(0, 0, char)
    }
    for (let i = lowerCharsMax; i > 0; i--) {
      let char = lowerChars ? lowerChars : numberChars;
      randPasswordArray.splice(0, 0, char)
    }
    for (let i = specialCharsMax; i > 0; i--) {
      let char = specialChars ? specialChars : numberChars;
      randPasswordArray.splice(0, 0, char)
    }
    const autoPassword = this.shuffleArray(randPasswordArray.map(function (x) { return x[Math.floor(Math.random() * x.length)] })).join('');
    console.log(autoPassword)
    return autoPassword;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  updatePassword = async (userUUID, userData, req) => {
    // update user password
    userData.passwordReset = false;
    const companyName = req.subdomain;
    const DB = await switchDB(companyName, employeeSchema);
    const model = await getDBModel(DB, "employee");
    return await model.updateMany({ uuid: userUUID }, { $set: userData }, { context: 'query', runValidators: true });
  }


  verifyUser = async (id, req) => {
    try {
      logger.info('Verify User , Data By: ' + JSON.stringify(id))
      const companyName = req.subdomain;
      const DB = await switchDB(companyName, employeeSchema);
      const model = await getDBModel(DB, "employee");

      // get user by id
      const user = await model.findOne({ $or:[ {'id':id}, {'userId':id} ]}).lean();     
      let token = uuidv4();
      const resetPasswordURL = config.settings.serverURL
      if (user != null && user.uuid) {
        const emailDB = await switchDB(companyName, employeeEmailSchema);
        const emailmodel = await getDBModel(emailDB, "employeeEmail");
      
        const employeeEmail = await emailmodel.findOne({ employeeUUID: user.uuid, type:"Official"}).lean();     
        // add new token to reset password
        const rDB = await switchDB(companyName, resetPasswordToken)
        const resetPasswordTokenModel = await getDBModel(rDB, 'resetPasswordToken')
         await resetPasswordTokenModel.insertMany([{ token: token, userUUID: user.uuid, isExpired: false }]);
        if(!employeeEmail?.email) { throw new Error("User doesn't have an official email to send the reset password link"); }
        // send mail password reset link
        return await sendMail({
          to: [employeeEmail.email],
          subject: "Reset password",
          template : `<h3>Hi ${user.firstName} ${user.lastName},</h3><p>Click on bellow link to reset your password</p><p><a href='${resetPasswordURL}/resetPassword/${token}'>Reset Password here</a></p>`
        })
      } else {
        return false;
      }
    } catch (error) {
      logger.error(error)
      throw new Error(error);
    }
  }

}

module.exports = new AuthService()
