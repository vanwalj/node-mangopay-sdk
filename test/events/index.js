'use strict';

var assert = require('assert');

const Chance = require('chance');

const Mangopay = require('../../');

const chance = new Chance();
const mangopayApp = process.env.MANGOPAY_APP;
const mangopaySecret = process.env.MANGOPAY_SECRET;

describe('events', function () {
    it('list events', function *(done) {
        try {
            const mangopay = new Mangopay(mangopayApp, mangopaySecret);
            yield mangopay.Event.list();
            return done();
        } catch (e) {
            return done(e);
        }
    });
});