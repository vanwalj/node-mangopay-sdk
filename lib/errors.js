'use strict';

class MangopayError extends Error {
    constructor (message, opts) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        Object.assign(this, {
            errorDocumentationUrl: 'https://docs.mangopay.com/api-references/error-codes/'
        }, opts);
        Error.captureStackTrace(this, this.constructor.name)
    }
}

class ParamError extends MangopayError {
    constructor (message, opts) {
        super(message, opts);
    }
}

module.exports.errors = {
    MangopayError,
    ParamError
};

module.exports.types = {
    param_error: ParamError
};