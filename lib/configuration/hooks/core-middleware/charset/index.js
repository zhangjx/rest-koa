/**
 * Charset hook
 */
module.exports = (restapi) => {
  return {

    /**
     * Default options
     */
    defaults: {
      charset: {
        charset: 'utf-8',
      }
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      restapi.app.use((req, res, next) => {
        res.charSet(restapi.config.charset.charset);
        return next();
      });

      cb();
    }
  };
};
