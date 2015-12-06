'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Joi = require('joi');

const _errors = require('./errors');

const validate = Promise.promisify(Joi.validate, { context: Joi });

const timestampize = (obj) =>
    _.mapValues(obj, (val) =>
        _.isDate(val) ?
        Math.round(val.getTime() / 1000) :
            _.isPlainObject(val) ?
                timestampize(val) :
                val
    );

const _validator = (obj, schema) =>
    _.isPlainObject(obj) ?
        validate(obj, schema, { abortEarly: false, stripUnknown: true }).then(timestampize) :
        validate(obj, schema);

const validator = (obj, schema) => _validator(obj, schema).catch(e => { throw new _errors.errors.ValidationError(e) });

module.exports = validator;