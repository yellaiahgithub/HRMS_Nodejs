// const { generalLogger: logger } = require('./../services/logger');
const logger = require('../../logging/services/logger').loggers.get('secuirty')
const { GenerateAccessToken } = require('../services/generateAccessToken')
const { ErrorBadRequest } = require('../../apiHandler/services/errorCode')
const conf = require("../../../conf/conf");
const Session = require('../../../models/SessionModel')
const apiResponse = require('./../../../helper/apiResponse')
// Middleware to generate access token and attach to res.locals
// params:
// cnonce - from the config - this is the client secret
// sessionUUID, userId, serverSecret - generated during login and saved to res.locals.session
// response: generates an access token and returns it back to client
// access_token = "2~" + sessionUUID + "~" + cnonce + "~" + Base64( SHA-256( cnonce + userId + serverSecret ))

function AccessToken(req, res, next) {
  const payload = {
    cnonce : conf.CNONCE,
    session: {
      sessionUUID: res.locals.session.sessionUUID,
      userId: res.locals.session?.userUUID,
      serverSecret: res.locals.session.serverSecret
    }
  }
  const newUser = new GenerateAccessToken(req, res)
  const userToken = newUser.getAccessToken(payload)
  res.locals.userToken = userToken
  return next()
}
// this updates the lastvalidation failure time, only if it has been more than 15 seconds since last failure.
const updateLastValidationFailure = async (res, currentTime) => {
  const { locals: { createLogContext } = { createLogContext: () => ({}) } } = res

  logger.debug(`${currentTime.toISOString()} called with failure datetime`, createLogContext())
  const lastValidationFailureTime = res.locals.session.lastValidationFailure
  const elapsedMillSec =
    lastValidationFailureTime &&
    currentTime.getTime() - new Date(lastValidationFailureTime).getTime()
  const needLastValidationFailureUpdate = elapsedMillSec && elapsedMillSec / 1000 > 15
  logger.debug(
    `lastValidationFailureTime: ${String(
      lastValidationFailureTime
    )}, elapsedMillSec: ${elapsedMillSec},
    in seconds: ${elapsedMillSec / 1000}, needLastValidationFailureUpdate: ${elapsedMillSec}`,
    createLogContext()
  )
  let result
  if (!lastValidationFailureTime || needLastValidationFailureUpdate) {
    logger.debug(
      `session updated with lastValidationFailure: ' ${currentTime.toISOString()}`,
      createLogContext()
    )
    try {
      await Session.updateOne(res.locals.session, {
        lastValidationFailure: currentTime.toISOString()
      })
      result = res.locals.session.lastValidationFailure
    } catch (err) {
      result = 'session update failed for lastValidationFailure'
    }
  } else {
    logger.debug(
      `Validation failure Neither first time:${lastValidationFailureTime} nor needLastValidationFailureUpdate : ${needLastValidationFailureUpdate}`,
      createLogContext()
    )
    result = undefined
  }
  return result
}
// this function validates the access token passed  in the header for other api requests except for login
// we have not implemented this to all the routes
async function validateAccessToken(req, res, next) {
  const { locals: { createLogContext } = { createLogContext: () => ({}) } } = res
  const bearerToken = req.headers.authorizations
  //logger.debug(JSON.stringify(req.headers), createLogContext())
  // verify access token present in the API call
  if (!bearerToken || bearerToken.split(' ').length !== 2) {
    const error = new Error('Authorization header Invalid')
    error.statusCode = 400
    error.id = `${ErrorBadRequest.id}TokenValidationFailed`
    apiResponse.unauthorizedResponse(res, "Authorization header Invalid")
    return next(error)
  }
  try {
    // grab session and client secret from passed accessToken
    const accessToken = bearerToken.split(' ')[1]
    const payload = {
      cnonce: accessToken.split('~')[2],
      session: {
        sessionUUID: accessToken.split('~')[1],
        userId: res.locals.session?.userUUID,
        serverSecret: res.locals.session.serverSecret
      }
    }

    const referencetoken = new GenerateAccessToken(req, res)

    const generatedAccessToken = referencetoken.getAccessToken(payload)

    if (generatedAccessToken === accessToken) {
      //logger.info(`access token validated  ${JSON.stringify(accessToken)}`, createLogContext())
      return next()
    }
    //logger.info('updateLastValidationFailure from validateAccessToken', createLogContext())

    apiResponse.unauthorizedResponse(res, "access token validation failed")
    throw new Error('access token validation failed')
  } catch (err) {
    try {
      const result = await updateLastValidationFailure(res, new Date())
      if (result === undefined) {
        throw new Error('function returned undefined')
      }
    } catch (error) {
      error.statusCode = 500
      error.id = 'ErrorDocumentWriteFailure'
      return next(error)
    }
    err.statusCode = 400
    err.id = `${ErrorBadRequest.id}TokenValidationFailed`
    return next(err)
  }
}
module.exports = {
  AccessToken,
  validateAccessToken,
  updateLastValidationFailure
}
