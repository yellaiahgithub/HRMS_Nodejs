const { ClientError } = require('./baseErrors')

const defaultMessage = 'The request could not be understood by the server due to malformed syntax'
class BadRequestError extends ClientError {
  constructor(message = defaultMessage, options = {}) {
    super(message)
    this.code = 400
    this.id = 'ErrorBadRequest'
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

class ValidationError extends ClientError {
  constructor(message = defaultMessage, options = {}) {
    super(message)
    this.code = 422
    this.id = 'ErrorValidation'
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

class UnauthorizedError extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 401
    this.id = 'ErrorUnauthorized'
    this.description = 'The request requires user authentication.'

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

class PaymentRequired extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 402
    this.id = 'ErrorPaymentRequired'
    this.description = 'The request requires user payment'

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

class Forbidden extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 403
    this.id = 'ErrorForbidden'
    this.description =
      'The server understood the request, but is refusing to fulfill it. Authorization will not help and the request SHOULD NOT be repeated'

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

class NotFoundError extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 404
    this.id = 'ErrorDocumentNotFound'
    this.description = 'The server has not found anything matching the Request-URI.'

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

class MethodNotAllowed extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 405
    this.id = 'ErrorMethodNotAllowed'
    this.description =
      'The method specified in the Request-Line is not allowed for the resource identified by the Request-URI.'

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

class NotAcceptable extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 406
    this.id = 'ErrorNotAcceptable'
    this.description =
      'The resource identified by the request is only capable of generating response entities which have content characteristics not acceptable according to the accept headers sent in the request.'

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

class ProxyAuthentication extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 407
    this.id = 'ErrorProxyAuthentication'
    this.description =
      'This code is similar to 401 (Unauthorized), but indicates that the client must first authenticate itself with the proxy.'

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

class RequestTimeout extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 408
    this.id = 'ErrorRequestTimeout'
    this.description =
      'The client did not produce a request within the time that the server was prepared to wait.'

    // this.statusCode = statusCode;
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

class Conflict extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 409
    this.id = 'ErrorConflict'
    this.description =
      'The request could not be completed due to a conflict with the current state of the resource.'

    // this.statusCode = statusCode;
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

class Gone extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 410
    this.id = 'ErrorGone'
    this.description =
      'The requested resource is no longer available at the server and no forwarding address is known.'

    // this.statusCode = statusCode;
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

class LengthRequired extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 411
    this.id = 'ErrorLengthRequired'
    this.description = 'The server refuses to accept the request without a defined Content- Length.'

    // this.statusCode = statusCode;
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

class PreconditionFailed extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 412
    this.id = 'ErrorPreconditionFailed'
    this.description =
      'The precondition given in one or more of the request-header fields evaluated to false when it was tested on the server'

    // this.statusCode = statusCode;
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

class RequestEntityTooLarge extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 413
    this.id = 'ErrorRequestEntityTooLarge'
    this.description =
      'The server is refusing to process a request because the request entity is larger than the server is willing or able to process.'

    // this.statusCode = statusCode;
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

class RequestUriTooLong extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 414
    this.id = 'ErrorRequestUriTooLong'
    this.description =
      'The server is refusing to service the request because the Request-URI is longer than the server is willing to interpret.'

    // this.statusCode = statusCode;
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

class UnsupportedMediaType extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 415
    this.id = 'ErrorUnsupportedMediaType'
    this.description =
      'The server is refusing to service the request because the entity of the request is in a format not supported by the requested resource for the requested method.'

    // this.statusCode = statusCode;
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

class RequestedRangeNotSatisfiable extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 416
    this.id = 'ErrorRequestedRangeNotSatisfiable'
    this.description = `A server SHOULD return a response with this status code if a request included a Range request-header field,
         and none of the range-specifier values in this field overlap the current extent of the selected resource, and the request did not include an If-Range request-header field.`

    // this.statusCode = statusCode;
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

class ExpectationFailed extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 417
    this.id = 'ErrorExpectationFailed'
    this.description =
      'The expectation given in an Expect request-header field could not be met by this server, or, if the server is a proxy, the server has unambiguous evidence that the request could not be met by the next-hop server.'

    // this.statusCode = statusCode;
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

class SessionCreateFailure extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 401
    this.id = 'ErrorSessionCreateFailure'
    this.description = 'Failed to create a session record for the user'

    // this.statusCode = statusCode;
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

class SessionExpired extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 401
    this.id = 'ErrorSessionExpired '
    this.description = 'Session used by the client is expired. User must log out and log back in.'

    // this.statusCode = statusCode;
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

class UnknownSession extends ClientError {
  constructor(message, options = {}) {
    super(message)
    this.code = 401
    this.id = 'ErrorUnknownSession '
    this.description =
      'Session used by the client cannot be found. User must log out and log back in.'

    // this.statusCode = statusCode;
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
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  PaymentRequired,
  Forbidden,
  NotFoundError,
  MethodNotAllowed,
  NotAcceptable,
  ProxyAuthentication,
  RequestTimeout,
  Conflict,
  Gone,
  LengthRequired,
  PreconditionFailed,
  RequestEntityTooLarge,
  RequestUriTooLong,
  UnsupportedMediaType,
  RequestedRangeNotSatisfiable,
  ExpectationFailed,
  SessionCreateFailure,
  SessionExpired,
  UnknownSession
}
