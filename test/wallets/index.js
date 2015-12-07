'use strict';

var assert = require('assert');

const Chance = require('chance');
const Promise = require('bluebird');

const Mangopay = require('../../');

const chance = new Chance();
const mangopayApp = process.env.MANGOPAY_APP;
const mangopaySecret = process.env.MANGOPAY_SECRET;

describe('wallets', function () {
    it('list wallets', function *(done) {
        try {
            const mangopay = new Mangopay(mangopayApp, mangopaySecret);
            const users = yield mangopay.User.list();
            yield Promise.map(users, function (user) {
                console.log(user);
                return user.Wallet.list();
            }).map(function (wallets) {
                console.log(wallets);
            });
            
            return done();
        } catch (e) {
            return done(e);
        }
    });
});