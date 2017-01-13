/**
 * Built-in hooks (order matters)
 */
module.exports = {
  dictionary: {
    _config: true,
    _api: true,
  },
  coreMiddleware: {
    acceptParser: true,
    queryParser: true,
    bodyParser: true,
    authorizationParser: false,
    ipFilter: true,
    dateParser: false,
    jsonp: false,
    cors: false,
    charset: true,
    gzipResponse: false,
    serveStatic: false,
    accessLog: true,
  },
};
