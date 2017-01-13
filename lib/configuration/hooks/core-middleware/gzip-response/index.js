/**
 * Gzip hook
 */
module.exports = (restapi) => {
  return {

    /**
     * Default options
     */
    defaults: {
      gzip: true,
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (restapi.config.gzip === true) {
        restapi.app.use(restapi.restify.gzipResponse());
      }

      cb();
    }
  };
};
