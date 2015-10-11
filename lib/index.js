/**
 * Created by Jordan on 11/10/15.
 */
'use strict';

const assert = require('assert');

const Promise = require('bluebird');
const _ = require('lodash');
const request = require('request');

const config = require('./config');

class Mangopay {
    constructor (username, password, opts) {
        assert(username && password, 'Please specify mangopay username and password');
        this.config = Object.assign({}, config, opts);
        this._username = username;
        this._password = password;

        this.events = {
            get: this._getEvents
        };

        this.users = {
            get: this._getUsers,
            create: this._createUser,
            update: this._updateUser
        };

        this.wallets = {};
        this.payIns = {};
        this.payOuts = {};
        this.cards = {};
        this.cardRegistrations = {};
        this.preauthorizations = {};
        this.transfers = {};
        this.refunds = {};
        this.KYCs = {};
    }

    _connect () {
        const _this = this;

        return new Promise(function (resolve, reject) {
            request.post(`${ _this.config.mangopayApiUrl }/v2/oauth/token`, {
                auth: {
                    user: _this._username,
                    pass: _this._password
                }
            }, function (err, response, body) {
                if (err) return reject(err);
                _this.bearer = body.bearer;
                return resolve(_this);
            });
        });
    }

    _request (method, path, opts) {
        opts = opts || {};
        const _this = this;

        if (!this.bearer) {
            return this._connect()
                .then(mangopay => mangopay._request.apply(mangopay, arguments));
        }
        
        return new Promise(function (resolve, reject) {
            request({ method, uri: `${ _this.config.mangopayApiUrl }${ path }`, qs: opts.qs, body: opts.body,
                auth: { bearer: _this.bearer }
            }, function (err, response, body) {
                if (err) return reject(err);
                if (response.statusCode === 401) {
                    return resolve(_this._connect()
                        .then(mangopay => mangopay._request.apply(mangopay, arguments))
                    );
                }
                return resolve(body);
            });
        });
    }

    _bindUser (user) {
        user.cards = { get: _.bind(this._getUserCards, this, user.id) };
        user.wallets = { get: _.bind(this._getUserWallets, this, user.id) };
        user.transactions = { get: _.bind(this._getUserTransactions, this, user.id) };
        user.bankAccounts = { get: _.bind(this._getUserBankAccounts, this, user.id) };
        user.update = _.bind(this._editUser, this, user.id, user.LegalPersonType ? 'legal' : 'natural');
        return user;
    }

    _bindWallet (wallet) {
        wallet.transactions = { get: _.bind(this._getWalletTransactions, this, wallet.id) };
    }

    _getEvents () {
        return this._request('GET', '/events')
    }

    _getUsers (userId) {
        if (userId) {
            return this._request('GET', `/users/${ userId }`)
                .then(this._bindUser.bind(this));
        }
        return this._request('GET', '/users')
            .map(this._bindUser.bind(this));
    }

    _createUser (type, userData) {
        return this._request('POST', `/users/${ type }`, userData)
            .then(this._bindUser.bind(this));
    }

    _updateUser (userId, type, userData) {
        return this._request('PUT', `/users/${ type }/${ userId }`, userData)
            .then(this._bindUser.bind(this));
    }

    _getUserCards (userId) {
        return this._request('GET', `/users/${ userId }/cards`);
    }

    _getUserWallets (userId) {
        return this._request('GET', `/users/${ userId }/wallets`)
            .map(this._bindWallet.bind(this));
    }

    _getUserTransactions (userId) {
        return this._request('GET', `/users/${ userId }/transactions`);
    }

    _getWalletTransactions (walletId) {
        return this._request('GET', `/wallets/${ walletId }/transactions`);
    }

    _getUserBankAccounts (userId) {
        return this._request('GET', `/users/${ userId }/bankaccounts`);
    }

}

module.exports = Mangopay;