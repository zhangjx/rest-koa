const _ = require('lodash');

/**
 * Serve Static hook
 */
module.exports = (restapi) => {
  return {

    /**
     * Default options
     */
    defaults: {
      serveStatic: {
        maxAge: 3600,
        charSet: null,
        etag: null,
        appendRequestPath: true,
      }
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (_.isPlainObject(restapi.config.serveStatic) && !_.isEmpty(restapi.config.serveStatic)) {
        restapi.app.use(restapi.restify.serveStatic({
          directory: restapi.config.serveStatic.directory,
          maxAge: restapi.config.serveStatic.maxAge,
          charSet: restapi.config.serveStatic.charSet,
          match: restapi.config.serveStatic.match,
          file: restapi.config.serveStatic.file,
          etag: restapi.config.serveStatic.etag,
          appendRequestPath: restapi.config.serveStatic.appendRequestPath,
        }));
      }

      cb();
    }
  };
};
