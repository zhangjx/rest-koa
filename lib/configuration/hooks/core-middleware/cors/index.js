const _ = require('lodash');

/**
 * CORS hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      cors: {
        origins: ['*'],
        credentials: false,
        headers: [],
      }
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (_.isPlainObject(restapi.config.cors) && !_.isEmpty(restapi.config.cors)) {
        restapi.app.use(restapi.restify.CORS({
          origins: restapi.config.cors.origins,
          credentials: restapi.config.cors.credentials,
          headers: restapi.config.cors.headers,
        }));
      }

      cb();
    }
  };
};
