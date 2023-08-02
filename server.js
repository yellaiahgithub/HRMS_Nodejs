const conf = require("./conf/conf");
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const { dbConnect } = require('./controllers/db')
const router = require('./routes') 
var session = require('express-session')
var MongoDBStore = require('connect-mongodb-session')(session);
// const cookieParser = require("cookie-parser");


const appStart = () => {
    const app = express()
    // app.use(cookieParser());

    // var store = new MongoDBStore({
    //   uri: conf.DB_URI,
    //   collection: 'mySessions'
    // });
    
    // // Catch errors
    // store.on('error', function(error) {
    //   console.log(error);
    // });
    // app.use(session({  
    //   secret: 'HRMS123',
    //   cookie: {
    //     maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    //   },
    //   store: store,
    //   resave: true,
    //   saveUninitialized: false
    // }))

    // const corsOptions = {
    //   origin: function (origin, callback) { 
    //       if (conf.WHITELIST_URLS.indexOf(origin) !== -1) { 
    //           callback(null, true) 
    //       } else { 
    //           callback(new Error('Not allowed by CORS')) 
    //       } 
    //   }, 
    //   credentials: true
    // }
    app.use(cors());

    app.use(bodyParser.json({limit: '10mb'}))
    app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))
    app.use((req, res, next) => {
      if(req.headers.origin) {   
        const host = req.headers.origin;
        const hostArray = host.split(".");
        const subdomain = hostArray.length >= 3 ? hostArray[0] : null;
        req.subdomain = subdomain?.split("//")[1];
      } else {
        req.subdomain = req.headers.host.split('.', 1)[0]
      } 
      // req.subdomain = "Namya"
      next();
    });
    app.use('/', router)

    app.use((req, res) => {
        // if not match any route
        res.status(404).send({ message: 'Not found.', status: 404, success: false })
    })
      
    var server = require('http').createServer(app);
    return server.listen(conf.PORT_LISTENING, () => console.log(`Listening on port ${conf.PORT_LISTENING}`))
}

const dbConnectionAndStartApp = async () => {
    //await dbConnect()
    // await dbConnect("mongodb://localhost:27017/hrms")
    appStart()
}

const startServer = async () => {
    try {
      await dbConnectionAndStartApp()
    } catch (error) {
      console.log(`Error occurred while trying to connect to database: ${error}`)
      console.log(`DB URI: ${conf.DB_URI}`)
      return process.exit(1)
    }
}
  
startServer()
  
module.exports.server = startServer