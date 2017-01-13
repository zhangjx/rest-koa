const _ = require('lodash');
const Sequelize = require('sequelize');

const RestError = require('./rest-error');

const buildError = (resource, field, code, msg) => {
  return ({
    message: msg,
    errors: [{ resource, field, code }],
  });
};

let errors;
module.exports = errors = {

  RestError,

  Internal(msg) {
    return new RestError.InternalError(msg);
  },

  BadRequest(msg) {
    return new RestError.BadRequestError(msg);
  },

  UnAuthorized(msg) {
    return new RestError.UnAuthorizedError(msg);
  },

  PermissionDenied(resource, field = null, msg) {
    const error = buildError(resource, field, 'permissionDenied', msg);
    return new RestError.PermissionDeniedError(error);
  },

  ResourceNotFound(resource = null, field = null, msg) {
    const error = buildError(resource, field, 'missing', msg);
    return new RestError.ResourceNotFoundError(error);
  },

  ExceedLimit(resource, field = null, msg) {
    const error = buildError(resource, field, 'exceedLimit', msg);
    return new RestError.ExceedLimitError(error);
  },

  AlreadyExists(resource, field, msg) {
    const error = buildError(resource, field, 'alreadyExists', msg);
    return new RestError.AlreadyExistsError(error);
  },

  InvalidArgument(resource, field, msg) {
    const error = buildError(resource, field, 'invalid', msg);
    return new RestError.InvalidArgumentError(error);
  },

  MissingParameter(resource, field, msg) {
    const error = buildError(resource, field, 'missingField', msg);
    return new RestError.MissingParameterError(error);
  },

  IfError(error, resource) {
    if (!error) { return null; }
    if (error instanceof Sequelize.Error) {
      return errors.SequelizeIfError(error, resource);
    }
    return new RestError.InternalError(error.message);
  },

  // Validation error -> invalid
  // string violation -> invalid
  // notNull Violation -> missing_field
  // unique violation -> already_exists
  SequelizeIfError(error, resource) {
    if (typeof error === 'string') { [resource, error] = [error, resource]; }
    if (!resource) { throw new Error('Missing `resource` parameter'); }
    if (!error) { return null; }
    const errs = [];
    if (error.name === 'SequelizeValidationError') {
      _.each(error.errors, (v) => {
        const obj = {
          resource,
          field: v.path,
          message: v.message,
          code: v.type === 'notNull Violation' ? 'missingField' : 'invalid',
        };
        return errs.push(obj);
      });
      return new RestError.ValidationFailedError({ errors: errs });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      _.each(error.errors, (v) => {
        const obj = {
          resource,
          field: v.path,
          message: v.message,
          code: 'alreadyExists',
        };
        return errs.push(obj);
      }
      );
      return new RestError.AlreadyExistsError({ errors: errs });
    }
    return new RestError.InternalError(error.message);
  }
};
