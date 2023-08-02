const logger = require('winston')
const confg = require('config')

const settings = confg.get('settings')

function handleIncomingRequest(req, res) {
  return new Promise((resolve) => {
    logger.info(`Incoming ${req.method} request: ${req.originalUrl}`)

    const options = {}

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
          +req.query.limit > settings.pagination.limit)
      ) {
        throw new Error(
          `Invalid query string value. Key: limit. Value: ${req.query.limit}. ` +
            `Expected: Integer greater than 0 but less than or equal to ${settings.pagination.limit}.`
        )
      }

      options.skip = Object.prototype.hasOwnProperty.call(req.query, 'skip') ? +req.query.skip : 0
      options.limit = Object.prototype.hasOwnProperty.call(req.query, 'limit')
        ? +req.query.limit
        : settings.pagination.limit
    } else if (req.method === 'PATCH' || req.method === 'UPDATE') {
      // PATCH and PUT requests are not required to honor the pagination limit, since there could an arbitrary number of objects to update.
      // With that said, it's still advised for API consumers to specify the limit where possible.
      if (
        Object.prototype.hasOwnProperty.call(req.query, 'limit') &&
        (Number.isNaN(req.query.limit) ||
          req.query.limit < 0 ||
          +req.query.limit > settings.pagination.limit)
      ) {
        throw new Error(
          `Invalid query string value. Key: limit. Value: ${req.query.limit}. ` +
            `Expected: Integer greater than 0 but less than or equal to ${settings.pagination.limit}.`
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

    resolve(results)
  })
}

const handleError = (err, req, res) => {
  // logger.error(`An error has occurred: ${err.name}. Message: ${err.message}`)

  // If you encounter this message, please make sure new Error() is passed into reject(), instead of a string or similar.
  if (!Object.prototype.hasOwnProperty.call(err, 'stack')) {
    logger.error(
      `FATAL: Object of a different type than Error passed into promise rejection.
       This needs to be fixed, otherwise you won't get any stack trace information!`
    )
    return res.status(500).send({ error: { name: err.name, message: err.message } })
  }

  logger.error('Stack trace:')
  logger.error(err.stack)

  if (err instanceof SyntaxError) {
    return res.status(400).send({ error: { name: err.name, message: err.message } })
  }

  if (err.statusCode === 404) {
    return res.status(404).send({ error: { name: err.name, message: err.message } })
  }

  if ('codeName' in err && err.codeName === 'BadValue') {
    return res.status(400).send({ error: { name: err.name, message: err.message } })
  }

  return res.status(500).send({ error: { name: err.name, message: err.message } })
}
module.exports = {
  handleIncomingRequest,
  handleError
}
