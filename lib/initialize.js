const _ = require('lodash');
const async = require('async');
const Router = require('./router');
const Model = require('./model');

module.exports = function initialize(callback) {
  // Callback is optional.
  callback = callback || function (err) {
    if (err) {
      this.log.error(err);
    }
  };

  async.auto({
    ready: cb => ready.apply(this, [cb]),
    runBootstrap: cb => runBootstrap.apply(this, [cb]),
  }, (err, results) => {
    if (err) {
      this.log.error(err);
    }
    callback(null, this);
  });

  /**
   * Returns function which is fired when Strapi is ready to go
   *
   * @api private
   */
  function ready(cb) {
    // Load models
    Model.init(this.config.database, this._models);
    this.models = Model;

    // Load routes
    this.routes(new Router(this.app, this.controllers, this.config.route));

    // Handle app uncaughtException error
    this.app.on('uncaughtException', (req, res, route, error) => {
      this.log.error(route, error);
      if (!res.finished) res.send(500, 'Internal error');
    });

    // Automatically define the server URL from `host`, and `port` config.
    this.config.url = `http://${this.config.host}:${this.config.port}`;

    // We can finally make the server listen on the configured port.
    this.app.listen(this.config.port, '0.0.0.0', () => {
      this.log.info(`Server started in ${this.config.rootPath}`);
      this.log.info(`Your server is running at ${this.config.url}`);
      this.log.info(`Launched at: ${new Date()}`);
      this.log.info(`Environment: ${this.config.env}`);
      this.log.info('To shut down your server, press <CTRL> + C at any time');
    });

    // Handle process uncaughtException error
    process.on('uncaughtException', (err) => {
      if (err.errno === 'EADDRINUSE') {
        this.log.error(`Port ${this.config.port} already in use.`);
        this.stop();
      } else {
        this.log.error(err);
      }
    });

    // Handle process unhandledRejection error
    process.on('unhandledRejection', (reason, p) => {
      this.log.error(reason, p);
    });

    // And fire the `ready` event.
    // This is listened to by attached servers, etc.
    this.emit('ready');
    cb();
  }

  /**
   * Method to run instance bootstrap
   *
   * @param {Function} cb [description]
   *
   * @api private
   */
  function runBootstrap(cb) {
    // Run boostrap script if specified.
    // Otherwise, do nothing and continue.
    if (!this.config.bootstrap) {
      return cb();
    }

    // If bootstrap takes too long, display warning message
    // (just in case user forgot to call their bootstrap's `cb`).
    const timeoutMs = this.config.bootstrapTimeout || 3500;
    const timer = setTimeout(() => {
      this.log.warn(`Bootstrap is taking unusually long to execute its callback (${timeoutMs} miliseconds).`);
      this.log.warn('Perhaps you forgot to call it?');
    }, timeoutMs);

    let ranBootstrapFn = false;

    try {
      return this.config.bootstrap((err) => {
        if (ranBootstrapFn) {
          this.log.error('You called the callback in `strapi.config.boostrap` more than once!');
          return;
        }
        ranBootstrapFn = true;
        clearTimeout(timer);
        return cb(err);
      });
    } catch (e) {
      if (ranBootstrapFn) {
        this.log.error('The bootstrap function threw an error after its callback was called.');
        this.log.error(e);
        return;
      }
      ranBootstrapFn = true;
      clearTimeout(timer);
      // this.emit('runBootstrapFn:done');
      return cb(e);
    }
  }
};
