/**
 * Authorization parser hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      authorizationParser: true,
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (restapi.config.authorizationParser === true) {
        restapi.app.use(restapi.restify.authorizationParser());
      }

      cb();
    }
  };
};
