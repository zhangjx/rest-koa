const _ = require('lodash');
const Sequelize = require('sequelize');

// Cache models
let Models = {};

// Define Model
const defineModel = (sequelize, models) => {
  // Each model settings define model
  _.each(models.settings, (v, k) => {
    Models[k] = Models[k] || v(sequelize);
  });

  // Handle model relation
  _.each(models.relations, v => v(Models));
  return Models;
};

// Handel Model defined `includes`
const handleIncludes = () => {
  _.each(Models, (model, name) => {
    let includes;
    if (!model.includes) return;

    if (_.isArray(model.includes)) {
      includes = {};
      _.each(model.includes, include => includes[include] = include);
      model.includes = includes;
    }

    _.each(model.includes, (v, k) => {
      if (!_.isArray(v)) {
        v = [v, true];
      }
      const [modelName, required] = v;
      model.includes[k] = {
        model: Models[modelName],
        as: k,
        required,
      };
    });
  });
  return Models;
};

// Handle search cols
const handleSearchCols = () => {
  _.each(Models, (model) => {
    if (!model.searchCols) return;
    _.each(model.searchCols, (v) => {
      if (_.isString(v.match)) v.match = [v.match];
    });
  });
  return Models;
};

// Use model Name get model object
const Model = (name) => {
  if (!name) return Models;
  return Models[name];
};

/**
 * Initalize models
 * @param {Object}  dbConfig  database config
 * @param {Object}  models    loaded model files
 * @param {Boolean} reset     reset Models flag
 * @return {Null}
 */
Model.init = (dbConfig, models, reset) => {
  if (!dbConfig || !_.isPlainObject(dbConfig)) {
    throw new Error('Error: No `dbConfig` specified!');
  }

  if (!models || !_.isPlainObject(models)) {
    throw new Error('Argument `models` must be an object!');
  }

  // Reset Models
  if (reset === true) Models = {};

  // Init Sequelize
  const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.pass, dbConfig);
  // Set timezone 0
  sequelize.query("SET time_zone='+0:00'").catch(err => console.error(err));

  // Define Model
  defineModel(sequelize, models);

  // Handle model includes
  handleIncludes();

  // Handle search cols
  handleSearchCols();
};

module.exports = Model;
