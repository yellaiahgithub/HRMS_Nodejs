const { MongoError } = require('./baseErrors')

const defaultMessage = 'Failed to locate a document in Mongo DB.'

class DocumentNotFound extends MongoError {
  constructor(message = defaultMessage, options = {}) {
    super(message)
    this.code = 404
    this.id = 'ErrorDocumentNotFound'
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

class DocumentReadFailure extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 404
    this.id = 'ErrorDocumentReadFailure'
    this.description = 'Failed to read a document in Mongo DB.'

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

class DocumentWriteFailure extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 400
    this.id = 'ErrorDocumentWriteFailure'
    this.description = 'Failed to create or update a document in Mongo DB.'

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

class DocumentDeleteFailure extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 400
    this.id = 'ErrorDocumentDeleteFailure'
    this.description = 'Failed to delete a document in Mongo DB.'

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

class DocumentInvalid extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 400
    this.id = 'ErrorDocumentInvalid'
    this.description = 'Document from Mongo DB has an invalid format.'

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

class DuplicateResourceId extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 409
    this.id = 'ErrorDuplicateResourceId'
    this.description = 'User assigned a unique ID to a resource which duplicates an existing ID.'

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

class FileNotFound extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 400
    this.id = 'ErrorFileNotFound'
    this.description = 'Failed to locate a file on the S3 bucket.'

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

class InvalidIdField extends MongoError {
  constructor(message, options = {}) {
    super(message)
    this.code = 400
    this.id = 'ErrorInvalidIdField'
    this.description = 'User assigned a unique ID to a resource which is invalid.'

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
  DocumentNotFound,
  DocumentReadFailure,
  DocumentWriteFailure,
  DuplicateResourceId,
  DocumentDeleteFailure,
  DocumentInvalid,
  FileNotFound,
  InvalidIdField
}
