// uuid v4 is random based
const { v4: uuidv4 } = require('uuid');
const { SESSION_ELAPSED } = require('config')
//const { findOneadminconfig } = require('../../../models/adminConfig')
const logger = require('../../logging/services/logger').loggers.get('session')
const { ErrorBadRequest, ErrorDocumentDeleteFailure, ErrorSessionCreateFailure, ErrorDocumentWriteFailure } = require('../../apiHandler/services/errorCode')
const apiResponse = require('./../../../helper/apiResponse')
const {
  SessionExpired,
  UnauthorizedError
} = require('../../../middlewares/errorHandler/clientError');
const { switchDB, getDBModel, sessionMongoSchema } = require("../../../middlewares/switchDB");
const checkCompanyName = require('../../../middlewares/checkCompanyName');

/* middleware used to issue a session
 * any exist session belong to same user will be deleted before issue a new session
 */

// this function scans for an existing session record and destorys if found one
// throws error if no session found, does not go to the catch block where the function is being called
const scanAndUpdateExistSession = async (userID) => {
  try {
    const companyName = checkCompanyName(req, res);
    const DB = await switchDB(companyName, sessionMongoSchema)
    const SessionModel = await getDBModel(DB, 'sessions')
    const updateRecord = await SessionModel.updateMany({ userUUID: userID, isActive: true }, { $set: { isActive: false } })
    // logger.info(`Session get destroyed when existing session found for the user: ${userID}`, createLogContext({ action: 'SessionEnd' }));
    return updateRecord
  } catch (err) {
    // logger.info(`No session found for user: ${userID}`, createLogContext({ action: 'None' }));
    return err
  }
}

const getElapsedTime = async () => {
  // try {
  //   const appParams = await findOneadminconfig({ name: 'appParams' }, { sessionTimeout: 1, _id: 0 })
  //     .lean()
  //   return appParams && appParams.sessionTimeout ? appParams.sessionTimeout : SESSION_ELAPSED
  // } catch (err) {
  return SESSION_ELAPSED
  //}
}

async function issueSessionRecord(req, res, next) {
  const { userInfo, createLogContext, userDetails } = res.locals
  let userID
  if (!userInfo && !userDetails) {
    // const error = new Error('No user login information found')
    // error.id = ErrorBadRequest.id
    // error.statusCode = 500
    // return next(error)
    errorResponse(res, "No user login information found")
  }
  // non Ad user
  if (userDetails && !userInfo) {
    userID = userDetails.userId
  }
  // Ad user
  if (userInfo && !userDetails) {
    userID = userInfo.oid
  }

  const timestap = new Date()

  const sessionRecord = {
    sessionUUID: uuidv4(),
    uuid: uuidv4(),
    userUUID: userID,
    serverSecret: uuidv4(),
    createdAt: new Date(),
    isActive: true,
    lastActivityTime: timestap.toISOString()
  }

  const createSession = async () => {
    // const newSession = new session(sessionRecord);
    // await newSession.save();
    
    const DBa = await switchDB(req.subdomain, sessionMongoSchema)
    const SessionModel = await getDBModel(DBa, 'sessions')



    await SessionModel.insertMany([sessionRecord])
    let elapsed = await getElapsedTime()
    if (!Number.isNaN(Number(elapsed))) {
      elapsed = Number(elapsed)
    } else {
      elapsed = 50400000 // 14 hr default session time out if the value is not avialble in both DB and Config
    }
    elapsed /= 1000 // converting to seconds
    // const sessionExpiryTime = new Date(Date.parse(sessionRecord.lastActivityTime) + elapsed);
    res.setHeader('sessionExpiryTime', elapsed)
    // logger.info(`Session is saved with id: ${sessionRecord.sessionUUID}`, createLogContext({ action: 'SessionStart', sessRecord: sessionRecord }));
  }
  try {
    //await scanAndUpdateExistSession(userID, createLogContext)
    await createSession()
  } catch (err) {
    err.statusCode = 500
    err.id = ErrorSessionCreateFailure.id
    return next(err)
  }
  res.locals.session = sessionRecord
  // req.session.userDetails = userDetails
  // req.session.save();
  return next()
}

/* middleware used to collect user session based on authorization header
 * access token will be extract from authorization header
 */
async function collectUserSession(req, res, next) {
  // const { createLogContext } = res.locals
  // added this because this middleware is being fired for all routes for some reason: not the case in the admin-api
  // TODO: Need a proper fix for this from Prometheus
  // if (
  //   req._parsedUrl.pathname === '/loginMethod' ||
  //   req._parsedUrl.pathname === '/loginNonAd' ||
  //   req._parsedUrl.pathname === '/logout' ||
  //   req._parsedUrl.pathname === '/login'
  // ) {
  //   return;
  // }
  // *** DO NOT use createLogContext function in this middleware, this middleware is called
  // *** before the context function generated
  const bearerToken = req.body.accessToken || req.headers.authorizations
  if (!bearerToken || bearerToken.split(' ').length !== 2) {
    apiResponse.unauthorizedResponse(res, "Authorization header Invalid.")
    const error = new UnauthorizedError('Authorization header Invalid.')
    return next(error)
  }
  try {
    const accessToken = bearerToken.split(' ')[1]
    const sessionUUID = accessToken.split('~')[1]
    const getSession = async () => {


      //const companyName = checkCompanyName(req, res);

      // if(!companyName){
      //   apiResponse.unauthorizedResponse(res, "Please send companyName in body.")
      // }
      const DB = await switchDB(req.subdomain, sessionMongoSchema)
      const SessionModel = await getDBModel(DB, 'sessions')
      const userSession = await SessionModel.findOne({ sessionUUID, isActive: true }).lean()
      if (userSession && userSession.sessionUUID) {
        return userSession
      }
      // logger.error('No session found for user:  ', createLogContext());
      apiResponse.unauthorizedResponse(res, "Session expired")
      throw new SessionExpired('Session expired.')
    }

    res.locals.session = await getSession()
    logger.debug(`get session ${JSON.stringify(res.locals.session)}`)
  } catch (err) {
    return next(err)
  }

  return next()
}

// middleware used to identify if the session has elapsed
// if not elapsed, update the last active time if it's more than 15s ago
async function validateAndUpdateSession(req, res, next) {
  // const { createLogContext } = res.locals
  let elapsed = await getElapsedTime()
  if (!Number.isNaN(Number(elapsed))) {
    elapsed = Number(elapsed)
  } else {
    elapsed = 28800000 // 8 hr if no activity then expire session , default session time out if the value is not avialble in both DB and Config
  }
  const { lastActivityTime, sessionUUID } = res.locals.session
  const currentTime = new Date()
  const isExpired = currentTime - Date.parse(lastActivityTime) > elapsed
  const needUpdate = currentTime - Date.parse(lastActivityTime) > 15 * 1000
  // const deleteExpiredSession = async () => {
  //   await SessionModel.updateOne({ sessionUUID, isActive: false })
  // }
  // const companyName = checkCompanyName(req, res);
  const DB = await switchDB(req.subdomain, sessionMongoSchema)
  const SessionModel = await getDBModel(DB, 'sessions')
  const updateLastActiveTime = async () => {
    await SessionModel.updateOne(res.locals.session, { lastActivityTime: currentTime.toISOString() })
  }
  // terminate current session if last activity time exceed elapse time
  if (isExpired) {
    apiResponse.unauthorizedResponse(res, "Session expired")
    const error = new SessionExpired('Session expired')
    try {
      await SessionModel.updateOne({ sessionUUID, isActive: false })
      //await deleteExpiredSession()

    } catch (err) {
      err.statusCode = 500
      err.errorMessage = err.message
      err.id = ErrorDocumentDeleteFailure.id
      return next(err)
    }
    throw new Error('Session expired')
    // logger.info('Session get destroyed when session timeout', createLogContext({ action: 'SessionEnd' }));
    return next(error)
  }

  // the last activity time is only updated if at least 15 seconds (configurable)
  // has elapsed since the last activity time
  if (!isExpired && needUpdate) {
    try {
      await updateLastActiveTime()
    } catch (err) {
      err.statusCode = 500
      err.id = ErrorDocumentWriteFailure.id
      return next(err)
    }
  }
  // const sessionExpiryTime = new Date(Date.parse(currentTime.toISOString()) + elapsed);
  res.setHeader('sessionExpiryTime', elapsed / 1000)
  return next()
}

/*
 * middleware used to desdroy session if session is valid
 * This middleware should be used after sessionValidation, so it doesn't need
 * to validate session again.
 */
async function terminateSession(req, res, next) {
  // const { createLogContext } = res.locals
  const DB = await switchDB(req.subdomain, sessionMongoSchema)
  const SessionModel = await getDBModel(DB, 'sessions')
  const deleteSession = async () => {
    await SessionModel.deleteOne({ sessionUUID: res.locals.session.sessionUUID })
  }

  try {
    await deleteSession()
  } catch (err) {
    err.statusCode = 500
    err.id = ErrorDocumentDeleteFailure.id
    return next(err)
  }

  // logger.info('Session get destroyed when the user logout', createLogContext({ action: 'SessionEnd' }));
  return next()
}

module.exports = {
  scanAndUpdateExistSession,
  issueSessionRecord,
  validateAndUpdateSession,
  terminateSession,
  collectUserSession
}
