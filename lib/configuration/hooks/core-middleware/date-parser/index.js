const _ = require('lodash');

/**
 * Date parser hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      dateParser: {
        clockSkew: 300,
      }
    },

    /**
     * Initialize the hook
     */

    initialize: (cb) => {
      if (_.isPlainObject(restapi.config.dateParser) && !_.isEmpty(restapi.config.dateParser)) {
        restapi.app.use(restapi.restify.dateParser({
          clockSkew: restapi.config.dateParser.clockSkew,
        }));
      }

      cb();
    }
  };
};
