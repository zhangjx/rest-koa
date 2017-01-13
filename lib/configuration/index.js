const pkg = require('../../package');

/**
 * Expose new instance of `Configuration`
 */
module.exports = class Configuration {

  /**
   * Restapi default configuration
   *
   * @api private
   */
  defaults(context, rootPath) {
    // If `rootPath` not specified, unfortunately, this is a fatal error,
    // since reasonable defaults cannot be assumed.
    if (!rootPath) {
      throw new Error('Error: No `rootPath` specified!');
    }

    // Set up config defaults.
    return {
      // Save `rootPath` in implicit defaults.
      // `rootPath` is passed from above in case `run` was used.
      // This is the directory where this Strapi process is being initiated from.
      // Usually this means `process.cwd()`.
      rootPath,

      // Make the environment in config match the server one.
      env: process.env.NODE_ENV || 'development',

      // Core settings non provided by hooks.
      host: process.env.HOST || process.env.HOSTNAME || context.config.host || 'localhost',
      port: process.env.PORT || context.config.port || 8888,

      // Default paths.
      paths: {
        config: 'config',
        api: 'api',
        controllers: 'api/controllers',
        helpers: 'api/helpers',
        models: 'api/models',
        middlewares: 'api/middlewares',
        services: 'api/services',
        routes: 'api/routes',
        static: 'public',
      },

      // Start off needed empty objects and strings.
      coreMiddlewares: {},
      externalMiddlewares: {},
      routes: {},
      hooks: {},
    };
  }

  /**
   * Load the configuration modules
   *
   * @api private
   */
  load(context, cb) {
    /**
     * Expose version/dependency info for the currently-running
     * Strapi on the `strapi` object (from its `package.json`).
     */
    context.version = pkg.version;
    context.dependencies = pkg.dependencies;

    // Override the previous contents of `strapi.config` with the new, validated
    // config with defaults and overrides mixed in the appropriate order.
    context.config = this.defaults(context, context.config.rootPath || process.cwd());
    cb();
  }
};
