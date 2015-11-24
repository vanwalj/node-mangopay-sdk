/**
 * Created by Jordan on 11/10/15.
 */
'use strict';

const Chance = require('chance');

const Mangopay = require('../index');

const chance = new Chance();
const mangopayApp = process.env.MANGOPAY_APP;
const mangopaySecret = process.env.MANGOPAY_SECRET;

describe('Mangopay sdk test suite', function () {
    this.timeout(10000);
    describe('users', function () {

        it('list', function *(done) {
            try {
                const mangopay = new Mangopay(mangopayApp, mangopaySecret);
                yield mangopay.Event.list();
                return done();
            } catch (e) {
                return done(e);
            }
        });

        it('create', function *(done) {
            try {
                const mangopay = new Mangopay(mangopayApp, mangopaySecret);
                const user = yield mangopay.User.create('natural', {
                    Email: chance.email(),
                    FirstName: chance.first(),
                    LastName: chance.last(),
                    Birthday: Math.round(chance.birthday().getTime() / 1000),
                    Nationality: 'FR',
                    CountryOfResidence: 'FR'
                });
                console.log(user);
                return done();
            } catch (e) {
                return done(e);
            }
        });

    });
});