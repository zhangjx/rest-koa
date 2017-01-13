/**
 * Accept parser hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {},

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      restapi.app.use(restapi.restify.acceptParser(restapi.app.acceptable));

      cb();
    }
  };
};
