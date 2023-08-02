const confg = require('config')

const settings = confg.get('settings')

const logger = require('../../common/logging/services/logger').loggers.get('general')

function handleIncomingRequest(req, res) {
  const { locals: { createLogContext } = { createLogContext: () => ({}) } } = res
  const { headers } = req

  return new Promise((resolve) => {
    logger.info(`Incoming ${req.method} request: ${req.originalUrl}`, createLogContext({}))

    const options = {}

    const jobUuid =
      typeof headers === 'object' && typeof headers['x-app-job-uuid'] === 'string'
        ? headers['x-app-job-uuid']
        : 'LIVE'

    // Disabling it for now. till the final versioning changes.
    // if (!jobUuid) {
    //   throw new Error('Invalid header. JobId is missing,');
    // }

    // Adding job Id to oprions for easy destructure at controllers.
    options.jobUuid = jobUuid

    if (req.method === 'GET') {
      // GET requests must always honor the pagination limit.
      // This may be overriden in the controller by not passing the limit into the query.
      if (
        Object.prototype.hasOwnProperty.call(req.query, 'skip') &&
        (Number.isNaN(req.query.skip) || req.query.skip < 0)
      ) {
        throw new Error(
          `Invalid query string value. Key: skip. Value: ${req.query.skip}. Expected: Integer greater than or equal to 0.`
        )
      }
      if (
        Object.prototype.hasOwnProperty.call(req.query, 'limit') &&
        (Number.isNaN(req.query.limit) ||
          req.query.limit < 0 ||
          +req.query.limit > +settings.pagination.limit)
      ) {
        throw new Error(
          `Invalid query string value. Key: limit. Value: ${req.query.limit}. Expected: Integer greater than 0 but less than or equal to ${settings.pagination.limit}.`
        )
      }

      options.skip = Object.prototype.hasOwnProperty.call(req.query, 'skip') ? +req.query.skip : 0
      options.limit = Object.prototype.hasOwnProperty.call(req.query, 'limit')
        ? +req.query.limit
        : +settings.pagination.limit
    } else if (req.method === 'PATCH' || req.method === 'UPDATE') {
      // PATCH and PUT requests are not required to honor the pagination limit, since there could an arbitrary number of objects to update.
      // With that said, it's still advised for API consumers to specify the limit where possible.
      if (
        Object.prototype.hasOwnProperty.call(req.query, 'limit') &&
        (Number.isNaN(req.query.limit) ||
          req.query.limit < 0 ||
          +req.query.limit > +settings.pagination.limit)
      ) {
        throw new Error(
          `Invalid query string value. Key: limit. Value: ${req.query.limit}. Expected: Integer greater than 0 but less than or equal to ${settings.pagination.limit}.`
        )
      } else options.limit = +req.query.limit
    }

    const { body } = req

    const results = {
      req,
      res,
      options,
      body
    }

    return resolve(results)
  })
}
// eslint-disable-next-line no-unused-vars
const handleError = (err, req, res, next) => {
  const { id, name, message, stack, errorBody } = !(err instanceof Error) ? {} : err

  const { locals: { createLogContext } = { createLogContext: () => ({}) } } = res
  logger.error(
    `An error has occurred: ${name} - Message: ${message} - Error Body: ${errorBody}`,
    createLogContext({ error: { id: id || 'please put an error id here' } })
  )

  // If you encounter this message, please make sure new Error() is passed into reject(), instead of a string or similar.
  if (!Object.prototype.hasOwnProperty.call(err, 'stack')) {
    logger.error(
      `FATAL: Object of a different type than Error passed into promise rejection.
       This needs to be fixed, otherwise you won't get any stack trace information!`
    )
    return res.status(500).send({ error: { name, message, errorBody } })
  }

  logger.error(
    'Stack trace:',
    createLogContext({ error: { id: id || 'please put an error id here' } })
  )
  logger.error(stack, createLogContext({ error: { id: id || 'please put an error id here' } }))

  if (err instanceof SyntaxError) {
    return res.status(400).send({ error: { name, message, errorBody } })
  }

  if ('codeName' in err && err.codeName === 'BadValue') {
    return res.status(400).send({ error: { name, message, errorBody } })
  }

  /*
   * Return the err.statusCode if provided; otherwise return default 500 status code.
   * err.statusCode should be set at the time the error is created.
   * We respond with a 500 status code when an error has not been handled.
   * As we become aware of these conditions, we should respond with the appropriate status code
   * instead of responding with a catch-all 500. The most pragmatic way to go about this would
   * be to monitor the service for 500 errors and investigate/fix/improve them as they occur.
   * Additionally, a test should be written for each discovered error condition.
   */
  return res
    .status(err.statusCode || 500)
    .send({ error: { name: err.name, message: err.message, errorBody } })
}

module.exports = {
  handleIncomingRequest,
  handleError
}
