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

        this.wallets = {
            get: this._getWallets,
            create: this._createWallet,
            update: this._updateWallet
        };

        this.cardRegistrations = {
            get: this._getCardRegistrations,
            create: this._createCardRegistration
        };

        this.payIns = {
            get: this._getPayIns,
            create: this._createPayIn
        };

        this.transfers = {
            get: this._getTransfers,
            create: this._createTransfer
        };

        this.KYCs = {
            documents: {
                get: this._getKYCDocuments
            }
        };

        this.payOuts = {};

        this.cards = {
            get: this._getCards,
            update: this._updateCard
        };

        this.preauthorizations = {};
        this.refunds = {};
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
        user.KYCs = {
            documents: {
                get: _.bind(this._getUserKYCDocuments, this, user.id),
                create: _.bind(this._createUserKYCDocument, this, user.id)
            }
        };

        user.update = _.bind(this._updateUser, this, user.id, user.LegalPersonType ? 'legal' : 'natural');
        user.reload = _.bind(this._getUsers, this, user.id);

        return user;
    }

    _bindWallet (wallet) {
        wallet.transactions = { get: _.bind(this._getWalletTransactions, this, wallet.id) };

        wallet.reload = _.bind(this._getWallets, this, wallet.id);

        return wallet;
    }

    _bindKycDocument (document, userId) {
        if (user) {
            document.update = _.bind(this._updateUserKYCDocument, this, userId, document);
            document.reload = _.bind(this._getUserKYCDocuments, this, userId, document.id);
            document.pages = {
                create: _.bind(this._createUserKYCDocumentPage, this, userId, document.id)
            };
        } else {
            document.reload = _.bind(this._getKYCDocuments, this, document.id);
        }

        return document;
    }

    _bindCardRegistration (cardRegistration) {
        cardRegistration.update = _.bind(this._updateCardRegistration, this, cardRegistration.id);
        cardRegistration.reload = _.bind(this._getCardRegistrations, this, cardRegistration.id);

        return cardRegistration;
    }

    _bindCard (card) {
        card.update = _.bind(this._updateCard, this, card.id);
        card.reload = _.bind(this._getCards, this, card.id);

        return card;
    }

    _bindTransfer (transfer) {
        transfer.reload = _.bind(this._getTransfers, transfer.id);

        return transfer;
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
        return this._request('GET', `/users/${ userId }/cards`)
            .map(this._bindCard.bind(this));
    }

    _getUserWallets (userId) {
        return this._request('GET', `/users/${ userId }/wallets`)
            .map(this._bindWallet.bind(this));
    }

    _getUserTransactions (userId) {
        return this._request('GET', `/users/${ userId }/transactions`);
    }

    _getUserBankAccounts (userId) {
        return this._request('GET', `/users/${ userId }/bankaccounts`);
    }

    _getWallets (walletId) {
        if (walletId) {
            return this._request('GET', `/wallets/${ walletId }`)
                .then(this._bindWallet.bind(this));
        }
        return this._request('GET', '/wallets')
            .map(this._bindWallet.bind(this));
    }

    _createWallet (walletData) {
        return this._request('POST', '/wallets', walletData)
            .then(this._bindWallet.bind(this));
    }

    _updateWallet (walletId, walletData) {
        return this._request('PUT', `/wallets/${ walletId }`, walletData)
            .then(this._bindWallet.bind(this));
    }

    _getWalletTransactions (walletId) {
        return this._request('GET', `/wallets/${ walletId }/transactions`);
    }

    _getPayIns (payInId) {
        if (payInId) {
            return this._request('GET', `/payins/${ payInId }`);
        }
        return this._request('GET', '/payins');
    }

    _createPayIn (method, type) {
        return this._request('POST', `/payins/${ method }/${ type }`);
    }

    _getCardRegistrations (cardRegistrationId) {
        return this._request('GET', `/cardregistration/${ cardRegistrationId }`)
            .then(this._bindCardRegistration.bind(this));
    }

    _createCardRegistration (cardRegistrationData) {
        return this._request('POST', '/cardregistration', cardRegistrationData)
            .then(this._bindCardRegistration.bind(this));
    }

    _updateCardRegistration (cardRegistrationId, cardRegistrationData) {
        return this._request('PUT', `/cardregistration/${ cardRegistrationId }`, cardRegistrationData)
            .then(this._bindCardRegistration.bind(this));
    }

    _getTransfers (transferId) {
        return this._request('GET', `/transfers/${ transferId }`)
            .then(this._bindTransfer.bind(this));
    }

    _createTransfer (transferData) {
        return this._request('POST', `/transfers`, transferData)
            .then(this._bindTransfer.bind(this));
    }

    _getUserKYCDocuments (userId, documentId) {
        if (documentId) {
            return this._request('GET', `/users/${ userId }/KYC/documents/${ documentId }`)
                .then(_.bind(this._bindKycDocument, this, _, userId));
        }
        return this._request('GET', `/users/${ userId }/KYC/documents`)
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _createUserKYCDocument (userId, documentData) {
        return this._request('POST', `/users/${ userId }/KYC/documents`, documentData)
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _getKYCDocuments (documentId) {
        if (documentId) {
            return this._request('GET', `/KYC/documents/${ documentId }`)
                .map(this._bindKycDocument.bind(this));
        }
        return this._request('GET', `/KYC/documents`)
            .then(this._bindKycDocument.bind(this));
    }

    _updateUserKYCDocument (userId, documentId, documentData) {
        return this._request('PUT', `/users/${ userId }/KYC/documents/${ documentId }`, documentData)
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _createUserKYCDocumentPage (userId, documentId, pageData) {
        return this._request('POST', `/users/${ userId }/KYC/documents/${ documentId }/pages`, pageData)
    }

    _getCards (cardId) {
        return this._request('GET', `/cards/${ cardId }`)
            .then(this._bindCard.bind(this));
    }

    _updateCard(cardId, cardData) {
        return this._request('PUT', `/cards/${ cardId }`, cardData)
            .then(this._bindCard.bind(this));
    }

}

module.exports = Mangopay;