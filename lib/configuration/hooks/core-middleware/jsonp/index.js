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
      jsonp: false,
    },

    /**
     * Initialize the hook
     */

    initialize: (cb) => {
      if (restapi.config.jsonp === true) {
        restapi.app.use(restapi.restify.jsonp());
      }

      cb();
    }
  };
};
