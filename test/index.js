'use strict';

// We disable bluebirds warnings in tests :)
process.env.BLUEBIRD_WARNINGS = 0;

describe('Mangopay sdk test suite', function () {
    // Mangopay sandbox is pretty slow sometimes.
    this.timeout(10000);
    require('./users');
    require('./events');
});