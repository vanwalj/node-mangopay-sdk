'use strict';

class MangopayError extends Error {
    constructor (message, opts) {
        super(message);
        this.name = this.constructor.name;
        Object.assign(this, {
            errorDocumentationUrl: 'https://docs.mangopay.com/api-references/error-codes/'
        }, opts);
        Error.captureStackTrace(this, this.constructor.name)
    }
}

class InternalServerError extends MangopayError {
    constructor () {
        super('Mangopay API Internal Server Error', {});
    }
}

class ConnectionError extends MangopayError {
    constructor () {
        super('Unable to connect to Mangopay, please check your credentials', {});
    }
}

class ParamError extends MangopayError {
    constructor (message, opts) {
        super(message, opts);
    }
}

class ValidationError extends MangopayError {
    constructor (opts) {
        super('Validation error', opts);
    }
}

module.exports.errors = {
    MangopayError,
    InternalServerError,
    ParamError,
    ConnectionError,
    ValidationError
};

module.exports.types = {
    param_error: ParamError
};