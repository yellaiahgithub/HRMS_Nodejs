const logger = require('../../common/logging/services/logger').loggers.get('general')
const ErrorCode = require('../../common/apiHandler/services/errorCode')
const ua = require('../../common/apiHandler/middlewares/os')

// Middleware to send error message back with status code passed by
function errorHandler(err, req, res, next) {
  const userAgent = ua(req)
  let { locals: { createLogContext } = {} } = res
  createLogContext = createLogContext || function emptyContext() {}
  if (err && err.statusCode) {
    logger.error(
      err.message,
      createLogContext({
        error: { id: err.id || ErrorCode.ErrorBadRequest.id },
        platform: userAgent.platform,
        os: userAgent.os
      })
    )
    res.status(err.statusCode).json(err)
    return next()
  }
  res.status(400).send({ error: err.message || err })
  return next()
}
module.exports = { errorHandler }
