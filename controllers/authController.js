const employeeService = require('../services/employeeService');
const AuthService = require('../services/authService');
const companyService = require('../services/companyService');
const apiResponse = require("../helper/apiResponse");
const logger = require('../common/logging/services/logger').loggers.get('general')
const CryptoJS = require("crypto-js");
const PasswordRuleService = require('../services/passwordRuleService');
const { sendMail } = require('../helper/SendMail');
const authService = require('../services/authService');

class AuthController {
    constructor() { }

    resetPassword = async (req, res) => {
        try {
            logger.info('Update user password: ' + JSON.stringify(req.data))
            const data = req.body
            if (data?.autoGeneratedPassword && !data?.email) { apiResponse.errorResponse(res, "Email not found") }

            let result = await AuthService.resetPassword(data, req, res);
            if (result) {
                return apiResponse.successResponseWithData(res, "User updated successfully.", data.password)
            } else {
                return apiResponse.errorResponse(res, "Invalid token.")
            }
        } catch (error) {
            logger.error(error)
            res.status(400).send(error.message)
        }
    }

    // API calling from forgot password page
    resetPasswordByToken = async (req, res) => {
        try {
            logger.info('Update user password: ' + JSON.stringify(req.data))
            const data = req.body
            if(!req.body.resetpasswordtokenUUID) {throw new Error('resetpasswordtokenUUID is required')};
            if(!req.body.password) {throw new Error('password is required')};

            let result = await AuthService.resetPasswordByToken(data, req, res);
            if (result) {
                return apiResponse.successResponseWithData(res, "Password updated successfully.")
            } else {
                return apiResponse.errorResponse(res, "Invalid token.")
            }
        } catch (error) {
            logger.error(error)
            res.status(400).send(error.message)
        }
    }

    // verify user by id
    verifyUser = async (req, res) => {
        try {
            logger.info('Verify User and send link, Data By: ' + JSON.stringify(req.query))

            let id = req.query.id;
            let verify = await authService.verifyUser(id, req);
            if (verify) {
                //req.response.message = "User verified successfully.";
                return apiResponse.successResponseWithData(res, "User verified successfully and the Reset password link has been sent to your official email.", verify)
            } else {
                // throw new Error("Invalid security answer.");
                apiResponse.errorResponse(res, "Invalid user." + id)
            }
        } catch (error) {
            logger.error(error)
            apiResponse.errorResponse(res, error.message)
        }
    }
}

module.exports = new AuthController()