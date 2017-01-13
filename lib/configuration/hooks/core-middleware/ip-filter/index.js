const _ = require('lodash');

/**
 * IP Filter middleware
 * @param {Mixed} opts  options can be Array or Object, like this
 *  ['192.168.0.*', '8.8.8.[0-3]']
 *  or
 *  {
 *    whiteList: ['192.168.0.*', '8.8.8.[0-3]'],
 *    blackList: ['144.144.*'],
 *  }
 * @return {Function}     middleware function
 */
const ip = (opts) => {
  // Handle opts
  if (typeof opts !== 'object') opts = {};
  if (_.isArray(opts)) opts = { whiteList: opts };

  return (req, res, next) => {
    // Get All ip
    req.ips = {};
    req.ips['remoteAddress'] = (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress);
    req.ips['x-forwarded-for'] = req.headers['x-forwarded-for'];
    req.ips['x-real-ip'] = req.headers['x-real-ip'];

    // Set IP to req
    req.ip = req.ips['x-real-ip'] || req.ips['x-forwarded-for'] || req.ips['remoteAddress'];

    let pass = false;
    // Handle IP whiteList
    let isPrivateIP = false;
    if (opts.whiteList && _.isArray(opts.whiteList)) {
      pass = opts.whiteList.some(item => RegExp(item).test(req.ip));
      if (pass) isPrivateIP = true;
    }

    // Handle IP blackList
    if (opts.blackList && _.isArray(opts.blackList)) {
      pass = !opts.blackList.some(item => RegExp(item).test(req.ip));
      if (!pass) return next(restapi.errors.UnAuthorized());
    }

    // Initialize isPrivateIP flag
    req.isPrivateIP = isPrivateIP || false;
    return next();
  };
};

/**
 * IP Filter hook
 */
module.exports = (restapi) => {
  return {

    /**
     * Default options
     */
    defaults: {
      ipFilter: {
        whiteList: [],
        blackList: [],
      }
    },

    /**
     * Initialize the hook
     */
    initialize: (cb) => {
      if (_.isPlainObject(restapi.config.ipFilter) && !_.isEmpty(restapi.config.ipFilter)) {
        restapi.app.use(ip({
          whiteList: restapi.config.ipFilter.whiteList,
          blackList: restapi.config.ipFilter.blackList,
        }));
      }

      cb();
    }
  };
};
