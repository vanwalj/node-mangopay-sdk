'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Joi = require('joi');

const validate = Promise.promisify(Joi.validate, { context: Joi });

const pascalize = (obj) =>
    _.mapValues(_.mapKeys(obj, (val, key) => _.capitalize(key)), (val) =>
        _.isPlainObject(val) ? pascalize(val) : val
    );

const timestampize = (obj) =>
    _.mapValues(obj, (val) =>
        _.isDate(val) ?
        Math.round(val.getTime() / 1000) :
            _.isPlainObject(val) ?
                timestampize(val) :
                val
    );

const validator = (obj, schema) =>
    _.isPlainObject(obj) ?
        validate(pascalize(obj), schema, { abortEarly: false }).then(timestampize) :
        validate(obj, schema);

module.exports = validator;