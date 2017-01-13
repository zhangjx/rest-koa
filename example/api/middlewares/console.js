module.exports = (restapi) => {
  return {
    defaults: {

    },

    initialize: (cb) => {
      restapi.app.use((req, res, next) => {
        restapi.log.info('custom middleware!!!');
        return next();
      });

      cb();
    },
  };
};
