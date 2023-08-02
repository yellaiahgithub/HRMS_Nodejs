const logger = require('../../logging/services/logger').loggers.get('general')
const User = require('../../../models/admin')
const { ErrorBadRequest } = require('../../apiHandler/services/errorCode')

module.exports.isAdminCheck = async (req, res, next) => {
  const message =
    'You do not have correct permissions to access this site. Please contact your local administrator to receive access.'
  const filter = {
    uuid:
      (res.locals && res.locals.userInfo && res.locals.userInfo.oid) ||
      (res.locals && res.locals.userDetails && res.locals.userDetails.uuid) ||
      null
  }
  // check if user has admin rights to log in.
  await User.findOne(filter, (errObj, document) => {
    const err = { ...errObj }
    function handleError(resp, errorObj, statusCode) {
      let error = { ...errorObj }
      let status
      if (!statusCode) {
        status = statusCode
        status = 400
      }
      error = error.id
        ? { error: true, message: error.message, id: error.id }
        : { error: true, message: error.message }
      logger.info('[error] ', error.message)
      return resp.status(status).json(error)
    }
    if (err) {
      err.error = { id: `${ErrorBadRequest.id}NoAdminUser` }
      return handleError(res, err, 400)
    }
    if (!document || !document.admin) {
      const error = new Error(message)
      error.statusCode = 400
      error.id = `${ErrorBadRequest.id}NoAdminUser`
      return handleError(res, error, error.statusCode || 400) // user doesn't exist
    }
    return next()
  }).exec()
}
