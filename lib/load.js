const path = require('path');
const _ = require('lodash');
const async = require('async');

// Local dependencies.
const Configuration = require('./configuration/index');
const loadHooks = require('./configuration/load-hooks');
const DEFAULT_HOOKS = require('./configuration/hooks/default-hooks');

/**
 * Initialize dictionary hooks, into the `hooks` global varialbe.
 *
 * @api private
 */
function initializeDictionaryHooks(cb) {
  // Pre-initialize hooks for create dictionary.
  _.assign(this.hooks, _.mapValues(_.get(DEFAULT_HOOKS, 'dictionary'), (hook, hookIdentity) => {
    return require(`./configuration/hooks/dictionary/${hookIdentity}`);
  }));

  return cb();
}

/**
 * Initiliaze middleware hooks,
 * and put them back into `hooks` (probably `restapi.hooks`).
 *
 * @api private
 */
function initializeMiddlewareHooks(cb) {
  // Reset
  this.hooks = {};
  this.tree = {};

  const defaultCoreMiddlewares = _.get(DEFAULT_HOOKS, 'coreMiddleware');
  // User can define hooks `this.config.coreMiddlewares`
  const userCoreMiddlewares = _.pickBy(this.config.coreMiddlewares, (value, key) => _.includes(_.keys(defaultCoreMiddlewares), key));
  // User can define hooks `this.config.externalMiddlewares`
  const externalMiddlewares = this.config.externalMiddlewares;

  // Create a tree of hook's path.
  _.forEach(defaultCoreMiddlewares, (hook, hookIdentity) => {
    _.set(this.tree, hookIdentity, {
      path: `./configuration/hooks/${_.kebabCase('coreMiddleware')}/${_.kebabCase(hookIdentity)}`,
      category: 'coreMiddleware',
    });
  });

  // Extend tree with external hooks.
  _.forEach(externalMiddlewares, (hook, hookIdentity) => {
    _.set(this.tree, hookIdentity, {
      path: path.resolve(this.config.rootPath, this.config.paths.middlewares, _.kebabCase(hookIdentity)),
      category: 'externalMiddleware',
    });
  });

  // Map (warning: we could have some order issues).
  const mapper = _.merge({}, defaultCoreMiddlewares, userCoreMiddlewares, externalMiddlewares);

  // Pick hook to load.
  this.hooks = _.pickBy(mapper, value => value !== false);

  // Require only necessary hooks.
  this.hooks = _.mapValues(this.hooks, (hook, hookIdentity) => {
    try {
      return require(_.get(this.tree, `${hookIdentity}.path`));
    } catch (err) {
      return cb(err);
    }
  });

  return cb();
}

/**
 * Load the files
 */
module.exports = function load(configOverride, cb) {
  if (this.exiting) {
    this.log.error('Cannot load or start an application after it has already been stopped.');
    process.exit(1);
  }

  // `configOverride` is optional.
  if (_.isFunction(configOverride)) {
    cb = configOverride;
    configOverride = {};
  }

  // Ensure override is an object and clone it (or make an empty object if it's not).
  configOverride = configOverride || {};
  this.config = _.cloneDeep(configOverride);
  this.hooks = {};

  async.auto({
    // Apply core defaults and hook-agnostic configuration,
    // esp. overrides including command-line options, environment variables,
    // and options that were passed in programmatically.
    config: cb => new Configuration().load(this, cb),
    // Optionally expose globals as soon as the
    // config hook is loaded.
    exposeGlobals: ['config', (result, cb) => this.exposeGlobals(cb)],
    // Initialize dictionary's hooks.
    initializeDictionaryHooks: ['exposeGlobals', (result, cb) => initializeDictionaryHooks.apply(this, [cb])],
    // Create configurations tree (dictionary).
    loadDictionary: ['initializeDictionaryHooks', (result, cb) => loadHooks.apply(this, [cb])],
    // Initialize hooks left.
    initializeMiddlewareHooks: ['loadDictionary', (result, cb) => initializeMiddlewareHooks.apply(this, [cb])],
    // Load hooks into memory.
    loadMiddleware: ['initializeMiddlewareHooks', (result, cb) => loadHooks.apply(this, [cb])],
  }, (err) => {
    if (err) {
      this.log.error(err);
    }

    this.emit('hooks:builtIn:ready');
    // Remove sensitive object.
    delete this.tree;
    cb(null, this);
  });

  // Makes `app.load()` chainable.
  return this;
};
