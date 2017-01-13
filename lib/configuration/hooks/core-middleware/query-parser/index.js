/**
 * Query parser hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      queryParser: {
        mapParams: true,
      }
    },

    /**
     * Initialize the hook
     */

    initialize: (cb) => {
      restapi.app.use(restapi.restify.queryParser({
        mapParams: restapi.config.queryParser.mapParams,
      }));

      cb();
    }
  };
};
