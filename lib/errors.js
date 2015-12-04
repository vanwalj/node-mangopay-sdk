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

class InternalServerError extends Error {
    constructor () {
        super('Mangopay API Internal Server Error', {});
    }
}

class ParamError extends MangopayError {
    constructor (message, opts) {
        super(message, opts);
    }
}

module.exports.errors = {
    MangopayError,
    InternalServerError,
    ParamError
};

module.exports.types = {
    param_error: ParamError
};