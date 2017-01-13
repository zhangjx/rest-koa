const _ = require('lodash');
const async = require('async');
const Hook = require('./hooks/index');

/**
 * Resolve the hook definitions and then finish loading them
 *
 * @api private
 */
module.exports = function loadHooks(cb) {
  function prepareHook(id) {
    let hookPrototype = this.hooks[id];

    // Handle folder-defined modules (default to `./lib/index.js`)
    // Since a hook definition must be a function.
    if (_.isObject(hookPrototype) && !_.isArray(hookPrototype) && !_.isFunction(hookPrototype)) {
      hookPrototype = hookPrototype.index;
    }

    if (!_.isFunction(hookPrototype)) {
      this.log.error(`Malformed (\`${id}\`) hook (in \`${_.get(this.tree, `${id}.category`)}\`)!`);
      this.log.error('Hooks should be a function with one argument (`restapi`)');
      this.stop();
    }

    // Instantiate the hook.
    const def = hookPrototype(this);

    // Mix in an `identity` property to hook definition.
    def.identity = id.toLowerCase();

    // If a config key was defined for this hook when it was loaded
    // (probably because a user is overridding the default config key),
    // set it on the hook definition.
    def.configKey = hookPrototype.configKey || def.identity;

    // New up an actual Hook instance.
    this.hooks[id] = new Hook(def);
  }

  // Function to apply a hook's `defaults` object or function.
  function applyDefaults(id) {
    // Get the hook defaults.
    const hook = this.hooks[id];
    const defaults = (_.isFunction(hook.defaults) ? hook.defaults(this.config) : hook.defaults) || {};
    _.defaultsDeep(this.config, defaults);
  }

  // Load a hook and initialize it.
  function loadHook(id, cb) {
    let timeout = true;

    setTimeout(() => {
      if (timeout) {
        this.log.error(`The hook \`${id}\` failed to load (too long to load) (in \`${_.get(this.tree, `${id}.category`)}\`)!`);
        process.nextTick(cb);
      }
    }, this.config.hookTimeout || 1000);

    this.hooks[id].load((err) => {
      timeout = false;

      if (err) {
        this.log.error(`The hook \`${id}\` failed to load (in \`${_.get(this.tree, `${id}.category`)}\`)!`);
        this.emit(`hook: ${id} :error`);
        return cb(err);
      }

      this.emit(`hook: ${id} :loaded`);

      // Defer to next tick to allow other stuff to happen.
      process.nextTick(cb);
    });
  }

  async.series(_.map(this.hooks, (hook, identity) => {
    return (cb) => {
      prepareHook.apply(this, [identity]);
      applyDefaults.apply(this, [identity]);
      loadHook.apply(this, [identity, cb]);
    };
  }), err => cb(err));
};
