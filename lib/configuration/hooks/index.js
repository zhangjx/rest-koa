const _ = require('lodash');

/**
 * Expose the strategy to load
 * built-in hooks
 */
module.exports = class Hook {

  constructor(definition) {
    /**
     * Default configuration for this hook
     * (should be overriden by hook definition)
     *
     * @return {}
     */
    this.defaults = {};
    this.config = {};

    // Merge default definition with overrides in the definition passed in.
    _.assign(this, definition);
  }

  initialize(cb) {
    return cb();
  }

  load(cb) {
    this.initialize(cb);
  }
};
