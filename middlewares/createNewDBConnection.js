const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
const options = {
  user : "root",
  pass : "LUhPrtjjTdI5",
  authSource : "admin",
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

 const changeDBURI = async(req, resp, next) => {
    let uri = 'mongodb://root:LUhPrtjjTdI5@3.7.71.2:27017/TESTXYZ';

 

    mongoose.connection.close();
    const client = await mongoose.connect(uri, options, (resp) => {
      console.log("Connected to MongoDB...", resp);
    });
        mongoose.connection.useDb(uri)
      // client.on('connected', function () {
      //     console.log('Mongoose default connection open to  ');
      //     next();
      // });

      // // When the connection is disconnected
      // client.on('disconnected', function (error) {

      //     console.log('Mongoose connection disconnected ', error);
      // });

      resp.locals.activeDB = client;
      next(); 
      
}



module.exports =  changeDBURI ;
