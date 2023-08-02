const mongoose = require('mongoose')

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
}

function connectDB() {
  return new Promise((resolve, reject) => {
    const mongoURL = `mongodb://root:LUhPrtjjTdI5@3.7.71.2:27017?authSource=admin`
    mongoose
      .connect(mongoURL, mongoOptions)
      .then((conn) => {
        console.log('connected')
        resolve(conn)
      })
      .catch((error) => reject(error))
  })
}

module.exports = connectDB 