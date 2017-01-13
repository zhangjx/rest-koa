const path = require('path');
const _ = require('lodash');
const async = require('async');
const dictionary = require('include-all');

/**
 * Async module loader to create a
 * dictionary of the user config
 */
module.exports = (restapi) => {
  return {
    /**
     * Initialize the hook
     */
    initialize: (callback) => {
      async.auto({
        // Load common settings from `./config/*.js|json`.
        'config/*': (cb) => {
          dictionary.aggregate({
            dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.config),
            excludeDirs: /(locales|envs)$/,
            filter: /(.+)\.(js|json)$/,
            depth: 2,
          }, cb);
        },

        // Load environment-specific config from `./config/envs/**/*.js|json`.
        'config/envs/current': (cb) => {
          const currentPath = path.resolve(restapi.config.rootPath, restapi.config.paths.config, 'envs', restapi.config.env);
          cb(null, require(currentPath));
        },

        // Load locales from `./config/locales/*.js`.
        'config/locales/*': (cb) => {
          dictionary.optional({
            dirname: path.resolve(restapi.config.rootPath, restapi.config.paths.config, 'locales'),
            filter: /(.+)\.(js|json)$/,
            identity: false,
            depth: 1,
          }, cb);
        },
      },

      // Callback.
      (err, config) => {
        // Just in case there is an error.
        if (err) {
          return callback(err);
        }

        // Remove cache. Load local `package.json`.
        delete require.cache[path.resolve(restapi.config.rootPath, 'package.json')];
        const packageJSON = require(path.resolve(restapi.config.rootPath, 'package.json'));
        const pkg = { version: packageJSON.version, dependencies: packageJSON.dependencies };

        // Merge default config and user loaded config together inside `restapi.config`.
        restapi.config = _.merge(restapi.config, config['config/*'], config['config/envs/current'], pkg);

        // Make the application name in config match the server one.
        restapi.app.name = restapi.config.name;

        // Initialize empty API objects.
        restapi.controllers = {};
        restapi.models = {};
        restapi.services = {};

        return callback();
      });
    }
  };
};
