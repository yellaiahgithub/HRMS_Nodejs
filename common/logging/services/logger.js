const winston = require('winston'); //  npm i winston   
const path = require('path');
const appConfig = require('config');
const storage = require('./configStorage'); // npm i data-store

const { format, transports } = winston;

const logCategories = ['api', 'security', 'session', 'general'];

const loggingLevels = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
  debug: 4
};
const loggingColors = {
  critical: 'magenta',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  debug: 'blue'
};

// Return a wisnton filter based on input config object
const generateLogFilter = (config, category) =>
  format(info => {
    if (config[info.level] === false) {
      return false;
    }
    // info['log'] = {};
    info['log.level'] = info['level'];
    delete info['level'];
    if (info.event) {
      info.event['category'] = category;
    } else {
      info.event = {};
      info.event['category'] = category;
    }
    return info;
  });

const filterMetadata = format(info => {
  const keys = ['event', 'service', 'ecs', 'http', 'url', 'magellan', 'cloud'];
  Object.keys(info).forEach(key => {
    if (keys.includes(key)) {
      delete info[key];
    }
  });

  return info;
});

/* *********************************
 * Enable user * route filter in future production
 const { category: logConfig, api: { userIds, URIs } = {} } = logConfigs;
 const userFilter = format((info, opts) => {
   if (
     info.level === 'api'
     && storage.get('log').category[info.level] === false
     && !userIds.find(info.user.id)
   ) {
     return false;
   }
   return info;
 });

 const routeFilter = format((info, opts) => {
   if (
     info.level === 'api'
     && storage.get('log').category[info.level] === false
     && !URIs.find(info.url.path)
   ) {
     return false;
   }
   return info;
 });

************************************ */

// Add logger level for console logs
const addLevel = format.printf(info => {
  if (info['log.level']) info.level = info['log.level'];
  return info;
});

function createConfigure(config, category) {
  const transportsArray = [
    //
    // - Write to all logs with level `debug` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({
      filename: path.join('logs/combined.log'),
      level: 'debug'
    }),
    new transports.File({
      filename: path.join('logs/error.log'),
      level: 'error'
    })
  ];

  if (process.env.NODE_ENV !== 'production') {
    transportsArray.push(
      new transports.Console({
        format: format.combine(
          addLevel,
          format.errors({ stack: true }),
          format.colorize(),
          format.simple()
        ),
        level: 'debug'
      })
    );
  }

  const combinedFormat =
    appConfig &&
    appConfig.get('settings') &&
    appConfig.get('settings').disableLogMetadata ?
      format.combine(
        format.timestamp(),
        generateLogFilter(config, category)(),
        filterMetadata(),
        format.json()
      ) :
      format.combine(
        format.timestamp(),
        generateLogFilter(config, category)(),
        format.json()
      );

  return {
    levels: loggingLevels,
    format: combinedFormat,
    // defaultMeta: { category },
    transports: transportsArray
  };
}

// reconfigure exist logger
const configureLoggers = () => {
  const { category: newConfigs } = storage.get('log');

  return logCategories.forEach(category => {
    const oldLogger = winston.loggers.get(category);
    oldLogger.configure(createConfigure(newConfigs[category], category));
  });
};

// add new loggers to winston object
winston.addColors(loggingColors);
const { category: newConfigs } = storage.get('log');

logCategories.forEach(category => {
  winston.loggers.add(
    category,
    createConfigure(newConfigs[category], category)
  );
});

module.exports = {
  configureLoggers,
  loggers: winston.loggers
};
