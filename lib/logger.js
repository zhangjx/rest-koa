const winston = require('winston');
const moment = require('moment');

/**
 * Common logger
 */
module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp() {
        return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
      },
      level: 'debug',
      colorize: 'level',
    })
  ]
});
