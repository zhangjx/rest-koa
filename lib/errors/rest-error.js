const util = require('util');

const _ = require('lodash');
const restify = require('restify');

const RestError = (errorCode, statusCode, defaultMsg = '') =>
  function BaseError(msg = '') {
    let message = defaultMsg;
    let body = null;

    if (typeof msg === 'string') {
      message = msg ? msg : defaultMsg;
    }

    if (typeof msg === 'object') {
      body = msg;
      if (!body.message) { body.message = message; }
    }

    const args = {
      restCode: `${errorCode[0].toLowerCase()}${errorCode.substring(1)}`,
      statusCode: statusCode || 500,
      message,
      constructorOpt: BaseError || RestError,
    };

    if (body) { args.body = body; }

    restify.RestError.call(this, args);
    return this.name = `${errorCode}Error`;
  }
;

const CODES = {
  BadRequest: 400,
  UnAuthorized: 401,
  PermissionDenied: 403,
  ResourceNotFound: 404,
  ExceedLimit: 409,
  AlreadyExists: 409,
  InvalidArgument: 422,
  MissingParameter: 422,
  ValidationFailed: 422,
  Internal: 500,
};

const MSGS = {
  BadRequest: 'Bad Request.',
  UnAuthorized: 'Authorization token is invalid.',
  PermissionDenied: 'Permission denied to access the specified resource.',
  ResourceNotFound: 'The specified resource does not exist.',
  ExceedLimit: 'Unable to add this resource - maximum exceeded.',
  AlreadyExists: 'Another resource has the same value as this field.',
  InvalidArgument: 'An invalid value was specified for one of the Argument.',
  MissingParameter: 'A required parameter was not specified for this request.',
  ValidationFailed: 'Validation Failed.',
  Internal: 'The server encountered an internal error.',
};

const Errors = _.reduce(CODES, ((acc, statusCode, errorCode) => {
  const name = `${errorCode}Error`;
  acc[name] = RestError(errorCode, statusCode, MSGS[errorCode]);
  util.inherits(acc[name], restify.RestError);
  return acc;
}), {});

Errors.RestError = RestError;

module.exports = Errors;
