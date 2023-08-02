// Here is the base error classes to extend from

class CustomError extends Error {
  get name() {
    return this.constructor.name
  }
}

class MongoError extends CustomError {}

class ServerError extends CustomError {}

class ClientError extends CustomError {}

module.exports = {
  ServerError,
  MongoError,
  ClientError
}
