const path = require('path');
const _ = require('lodash');
const async = require('async');
const dictionary = require('include-all');

/**
 * Async module loader to create a
 * dictionary of the user APIs.
 */
module.exports = (restapi) => {
  return {
    /**
     * Initialize the hook
     */
    initialize: (callback) => {
      async.auto({
        // Load API controllers from `./api/controllers/*.js`
        'controllers/*': (cb) => {
          dictionary.optional({
            dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.controllers),
            filter: /(.+)\.(js)$/,
            identity: false,
            depth: 1,
          }, cb);
        },

        // Load API models from `./api/models/*.js`
        'models/*': (cb) => {
          async.parallel({
            settings: (cb) => {
              dictionary.optional({
                dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.models),
                excludeDirs: /(index|base|associations)$/,
                filter: /^((?!base).+)\.(js|json)$/,
                identity: false,
                depth: 1,
              }, cb);
            },
            relations: (cb) => {
              dictionary.optional({
                dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.models, 'associations'),
                filter: /(.+)\.js$/,
                identity: false,
                depth: 1,
              }, cb);
            },
          }, cb);
        },

        // Load API services from `./api/services/*.js`.
        'services/*': (cb) => {
          dictionary.optional({
            dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.services),
            filter: /(.+)\.(js)$/,
            depth: 1,
          }, cb);
        },

        // Load API helpers from `./api/helpers/*.js`.
        'helpers/*': (cb) => {
          dictionary.optional({
            dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.helpers),
            filter: /(.+)\.(js)$/,
            identity: false,
            depth: 1,
          }, cb);
        },

        // Load API routrs from `./api/routes.js`.
        'routes/*': (cb) => {
          const routePath = path.resolve(restapi.config.rootPath, restapi.config.paths.routes);
          cb(null, require(routePath));
        },
      },

      // Callback.
      (err, api) => {
        // Just in case there is an error.
        if (err) {
          return callback(err);
        }

        // Merge API controllers with the main ones.
        restapi.controllers = _.merge({}, restapi.controllers, api['controllers/*']);

        // Merge API models with the main ones.
        restapi._models = api['models/*'];

        // Merge API services with the main ones.
        restapi.services = _.merge({}, restapi.services, api['services/*']);

        // Merge API helpers with the main ones.
        restapi.helpers = _.merge({}, restapi.helpers, api['helpers/*']);

        // Merge API routes with the main ones.
        restapi.routes = api['routes/*'];

        return callback();
      });
    }
  };
};
