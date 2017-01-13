const morgan = require('morgan');
const moment = require('moment');

const logFormat = [
  ':date - :remote-addr - :remote-user ":method :url HTTP/:http-version"',
  ':status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
].join(' ');
morgan.token('date', () => moment().format('YYYY-MM-DD HH:mm:ss:SSS'));

/**
 * Access Logger hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      accessLog: true,
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (restapi.config.accessLog === true) {
        restapi.app.use(morgan(logFormat));
      }

      cb();
    }
  };
};
