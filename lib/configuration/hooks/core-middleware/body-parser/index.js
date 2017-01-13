/**
 * Body parser hook
 */
module.exports = (restapi) => {
  return {
    /**
     * Default options
     */
    defaults: {
      bodyParser: {
        maxBodySize: 0,
        mapParams: true,
        overrideParams: false,
      }
    },

    /**
     * Initialize the hook
     */

    initialize: (cb) => {
      restapi.app.use(restapi.restify.bodyParser({
        maxBodySize: restapi.config.bodyParser.maxBodySize,
        mapParams: restapi.config.bodyParser.mapParams,
        overrideParams: restapi.config.bodyParser.overrideParams,
      }));

      cb();
    }
  };
};
