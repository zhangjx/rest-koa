const EventEmitter = require('events');

const async = require('async');
const mysql = require('mysql');
const restify = require('restify');
const Sequelize = require('sequelize');
const helpers = require('open-rest-wrap-helpers');
const Router = require('./router');
const errors = require('./errors');
const logger = require('./logger');
const model = require('./model');
const load = require('./load');
const initialize = require('./initialize');

/**
 * Expose new instance of `Application`
 *
 */
module.exports = class Application extends EventEmitter {

  constructor() {
    super();

    // Remove memory-leak warning about max listeners
    this.setMaxListeners(0);

    // Expose `restify`
    this.restify = restify;

    // Expose `Sequelize`
    this.Sequelize = Sequelize;

    // Expose `mysql`
    this.mysql = mysql;

    // Expose `application instance`
    this.app = restify.createServer();

    // Expose every middleware inside `strapi.middlewares`
    this.middlewares = [];

    // Expose `Router`
    this.Router = Router;

    // Expose `Error`
    this.errors = errors;

    // Expose `model`
    this.model = model;

    // New Winston logger
    this.log = logger;

    // Expose `helper`
    this.helpers = helpers(this);
  }

  /*
   * Method to load instance
   *
   * @api private
   */
  load(config, cb) {
    load.apply(this, [config, cb]);
  }

  /*
   * Method to initialize instance
   *
   * @api private
   */
  initialize(cb) {
    initialize.apply(this, [cb]);
  }

  /**
   * Method to start instance
   *
   * @api public
   */
  start(callback) {
    // Callback is optional.
    callback = callback || function callback(err) {
      if (err) {
        return this.log.error(err);
      }
    };

    const scope = {
      rootPath: process.cwd(),
    };

    async.series([
      cb => this.load(scope, cb),
      cb => this.initialize(cb),
    ], (err) => {
      if (err) {
        this.log.error('Failed start the application.', err);
        return this.stop();
      }

      // Emit an event when Restapi has started.
      this.started = true;
      this.emit('started');
      return callback(null, this);
    });
  }

  /**
   * The inverse of `start()`, this method shuts down all attached servers.
   *
   * @api public
   */
  stop() {
    // Flag `this.exiting` as soon as the application has begun to shutdown.
    // This may be used by hooks and other parts of core.
    this.exiting = true;

    // Emit a `stop` event.
    this.emit('stop');

    // Exit the REPL.
    process.exit(0);
  }

  /**
   * Expose certain global variables.
   *
   * @api private
   */
  exposeGlobals(cb) {
    global.restapi = this;
    return cb();
  }
};
