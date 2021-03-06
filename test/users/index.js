'use strict';

var assert = require('assert');

const Chance = require('chance');

const Mangopay = require('../../');

const chance = new Chance();
const mangopayApp = process.env.MANGOPAY_APP;
const mangopaySecret = process.env.MANGOPAY_SECRET;

describe('users', function () {

    it('create a user bank account', function *(done) {
        try {
            const mangopay = new Mangopay(mangopayApp, mangopaySecret);
            const user = yield mangopay.User.Natural.create({
                Email: chance.email(),
                FirstName: chance.first(),
                LastName: chance.last(),
                Birthday: chance.birthday(),
                Nationality: 'FR',
                CountryOfResidence: 'FR'
            });
            yield user.BankAccount.create('IBAN', {
                OwnerName: user.FirstName,
                OwnerAddress: {
                    AddressLine1: '20 Rue de la Santé',
                    City: 'Rennes',
                    PostalCode: '35000',
                    Country: 'FR'
                },
                IBAN: "FR7618829754160173622224154",
                BIC: "CMBRFR2BCME",
                Tag: "custom tag"
            });
            return done();
        } catch (e) {
            console.error(e);
            return done(e);
        }
    });

    it('create user', function *(done) {
        try {
            const mangopay = new Mangopay(mangopayApp, mangopaySecret);
            yield mangopay.User.Natural.create({
                Email: chance.email(),
                FirstName: chance.first(),
                LastName: chance.last(),
                Birthday: chance.birthday(),
                Nationality: 'FR',
                CountryOfResidence: 'FR'
            });
            return done();
        } catch (e) {
            console.error(e);
            return done(e);
        }
    });

    it('list user transactions', function *(done) {
        try {
            const mangopay = new Mangopay(mangopayApp, mangopaySecret);
            const user = yield mangopay.User.Natural.create({
                Email: chance.email(),
                FirstName: chance.first(),
                LastName: chance.last(),
                Birthday: chance.birthday(),
                Nationality: 'FR',
                CountryOfResidence: 'FR'
            });
            yield user.Transaction.list({
                page: 1,
                per_page: 100
            });
            return done();
        } catch (e) {
            return done(e);
        }
    });


    it('try to create a bank account with a falsy IBAN', function *(done) {
        try {
            const mangopay = new Mangopay(mangopayApp, mangopaySecret);
            const user = yield mangopay.User.Natural.create({
                Email: chance.email(),
                FirstName: chance.first(),
                LastName: chance.last(),
                Birthday: chance.birthday(),
                Nationality: 'FR',
                CountryOfResidence: 'FR'
            });
            try {
                yield user.BankAccount.create('IBAN', {
                    OwnerName: user.FirstName,
                    OwnerAddress: {
                        AddressLine1: '20 Rue de la Santé',
                        City: 'Rennes',
                        PostalCode: '35000',
                        Country: 'FR'
                    },
                    IBAN: "FR7618829754160173622224153",
                    BIC: "CMBRFR2BCME",
                    Tag: "custom tag"
                });
            } catch (e) {
                assert(e instanceof Mangopay.errors.MangopayError);
                assert(e instanceof Mangopay.errors.ParamError);
                return done();
            }
            return done('Should have thrown');
        } catch (e) {
            return done(e);
        }
    });

});