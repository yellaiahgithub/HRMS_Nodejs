const { ServerError } = require('./baseErrors')

const defaultMessage =
  'The server encountered an unexpected condition which prevented it from fulfilling the request.'
class InternalServerError extends ServerError {
  constructor(message = defaultMessage, options = {}) {
    super(message)
    this.code = 500
    this.id = 'ErrorInternalServerError'
    this.description = message

    // You can attach relevant information to the error instance
    // (e.g.. the username)

    Object.entries(options).forEach(([key, value]) => {
      this[key] = value
    })
  }

  get statusCode() {
    return this.code
  }
}

module.exports = {
  InternalServerError
}
