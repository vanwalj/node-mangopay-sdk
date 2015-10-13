/**
 * Created by Jordan on 11/10/15.
 */
'use strict';

const assert = require('assert');

const Promise = require('bluebird');
const _ = require('lodash');
const request = require('request');

const config = require('./config');
const _errors = require('./errors');

class Mangopay {

    static get errors () {
        return _errors.errors;
    }

    constructor (username, password, opts) {
        assert(username && password, 'Please specify mangopay username and password');
        this.config = Object.assign({}, config, opts);
        if (!this.config.production) {
            this.config.mangopayApiUrl = this.config.mangopaySandboxApiUrl;
        }
        this._username = username;
        this._password = password;

        this.Events = {
            list: this._listEvents.bind(this)
        };

        this.Users = {
            get: this._getUser.bind(this),
            list: this._listUsers.bind(this),
            create: this._createUser.bind(this),
            update: this._updateUser.bind(this)
        };

        this.Wallets = {
            get: this._getWallet.bind(this),
            list: this._listWallets.bind(this),
            create: this._createWallet.bind(this),
            update: this._updateWallet.bind(this)
        };

        this.CardRegistrations = {
            get: this._getCardRegistration.bind(this),
            create: this._createCardRegistration.bind(this)
        };

        this.PayIns = {
            get: this._getPayIn.bind(this),
            list: this._listPayIns.bind(this),
            create: this._createPayIn.bind(this),
            BankWire: {
                Direct: {
                    create: this._createDirectBankWirePayIn.bind(this)
                }
            },
            DirectDebit: {
                Web: {
                    create: this._createWebDirectDebitPayIn.bind(this)
                }
            },
            PreAuthorized: {
                Direct: {
                    create: this._createDirectPreAuthorizedPayIn.bind(this)
                }
            },
            Card: {
                Direct: {
                    create: this._createDirectCardPayIn.bind(this)
                },
                Web: {
                    create: this._createWebCardPayIn.bind(this)
                }
            }
        };

        this.Transfers = {
            get: this._getTransfer.bind(this),
            create: this._createTransfer.bind(this)
        };

        this.KYCs = {
            Documents: {
                get: this._getKYCDocument.bind(this),
                list: this._listKYCDocuments.bind(this)
            }
        };

        this.Cards = {
            get: this._getCard.bind(this),
            update: this._updateCard.bind(this)
        };

        this.PayOuts = {
            get: this._getPayOut.bind(this),
            BankWire: {
                create: this._createBankWirePayout.bind(this)
            }
        };

        this.Refunds = {
            get: this._getRefund.bind(this)
        };

        this.Preauthorizations = {
            get: this._getPreauthorization,
            update: this._updatePreauthorization,
            Card: {
                Direct: {
                    create: this._createDirectCardPreauthorization.bind(this)
                }
            }
        };

        this.Disputes = {
            get: this._getDispute.bind(this),
            list: this._listDisputes.bind(this),
            update: this._updateDispute.bind(this),
            close: this._closeDispute.bind(this),
            contest: this._contestDispute.bind(this),
            reSubmit: this._submitDispute.bind(this)
        };
    }

    _connect () {
        const _this = this;

        return new Promise(function (resolve, reject) {
            request.post(`${ _this.config.mangopayApiUrl }/${ _this.config.apiVersion }/oauth/token`, {
                json: true,
                auth: {
                    user: _this._username,
                    pass: _this._password
                },
                body: { grant_type: 'client_credentials' }
            }, function (err, response, body) {
                if (err) return reject(err);
                if (response.statusCode !== 200) return reject(new Error('Mangopay API Connection failure'));
                _this.bearer = body['access_token'];
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
            request({ method, uri: `${ _this.config.mangopayApiUrl }/${ _this.config.apiVersion }/${ _this._username }/${ path }`,
                qs: opts.qs, body: opts.body, json: true,
                auth: { bearer: _this.bearer }
            }, function (err, response, body) {
                if (err) {
                    return reject(err);
                }
                if (response.statusCode === 401) {
                    // Token expired, connect then replay request
                    return resolve(_this._connect()
                        .then(mangopay => mangopay._request.apply(mangopay, arguments))
                    );
                }
                if (response.statusCode >= 400 && response.statusCode < 500) {
                    console.error(body);
                    return reject(new Error(`Mangopay client error: ${ body.Message }`, body));
                }
                if (response.statusCode >= 500) {
                    return reject(new Error('Mangopay API Server Error'));
                }
                return resolve(body);
            });
        });
    }

    _bindUser (user) {

        user.update = this._updateUser.bind(this, user.id, user.LegalPersonType ? 'legal' : 'natural');
        user.reload = this._getUser.bind(this, user.id);

        user.Cards = {
            list: this._listUserCards.bind(this, user.id)
        };
        user.Wallets = {
            list: this._listUserWallets.bind(this, user.id)
        };
        user.Transactions = {
            list: this._listUserTransactions.bind(this, user.id)
        };
        user.BankAccounts = {
            list: this._listUserBankAccounts.bind(this, user.id),
            create: this._createUserBankAccount.bind(this, user.id)
        };
        user.KYCs = {
            Documents: {
                list: this._listUserKYCDocuments.bind(this, user.id),
                create: this._createUserKYCDocument.bind(this, user.id)
            }
        };

        return user;
    }

    _bindWallet (wallet) {
        wallet.reload = this._getWallet.bind(this, wallet.id);

        wallet.transactions = {
            list: this._listWalletTransactions.bind(this, wallet.id)
        };

        return wallet;
    }

    _bindKycDocument (document, userId) {
        if (userId) {
            document.update = this._updateUserKYCDocument.bind(this, userId, document);
            document.reload = this._getUserKYCDocument.bind(this, userId, document.id);
            document.pages = {
                create: this._createUserKYCDocumentPage.bind(this, userId, document.id)
            };
        } else {
            document.reload = this._getKYCDocument.bind(this, document.id);
        }

        return document;
    }

    _bindCardRegistration (cardRegistration) {
        cardRegistration.update = this._updateCardRegistration.bind(this, cardRegistration.id);
        cardRegistration.reload = this._getCardRegistration.bind(this, cardRegistration.id);

        return cardRegistration;
    }

    _bindCard (card) {
        card.update = this._updateCard.bind(this, card.id);
        card.reload = this._getCard.bind(this, card.id);

        return card;
    }

    _bindTransfer (transfer) {
        transfer.reload = this._getTransfer.bind(this, transfer.id);
        transfer.refund = {
            create: this._createTransferRefund.bind(this, transfer.id)
        };

        return transfer;
    }

    _bindBankAccount (bankAccount, userId) {
        bankAccount.reload = this._getUserBankAccount.bind(this, userId, bankAccount.id);

        return bankAccount;
    }

    _bindPayOut (payOut) {
        payOut.reload = this._getPayOut.bind(this, payOut.id);

        return payOut;
    }

    _bindPayIn (payIn) {
        payIn.reload = this._getPayIn.bind(this, payIn.id);
        payIn.refunds = {
            create: this._createPayInRefund.bind(this, payIn.id)
        };

        return payIn;
    }

    _bindRefund (refund) {
        refund.reload = this._getRefund.bind(this, refund.id);

        return refund;
    }

    _bindDispute (dispute) {
        dispute.reload = this._getDispute.bind(this, dispute.id);
        dispute.update = this._updateDispute.bind(this, dispute.id);
        dispute.close = this._closeDispute.bind(this, dispute.id);
        dispute.contest = this._contestDispute.bind(this, dispute.id);
        dispute.submit = this._submitDispute.bind(this, dispute.id);

        return dispute;
    }

    _bindPreauthorization (preauthorization) {
        preauthorization.reload = this._getPreauthorization.bind(this, preauthorization.id);
        preauthorization.update = this._updatePreauthorization.bind(this, preauthorization.id);

        return preauthorization;
    }

    _listEvents (opts) {
        return this._request('GET', '/events', { qs: opts });
    }

    _listUsers (opts) {
        return this._request('GET', '/users', { qs: opts })
            .map(this._bindUser.bind(this));
    }

    _getUser (userId) {
        return this._request('GET', `/users/${ userId }`)
            .then(this._bindUser.bind(this));
    }

    _createUser (type, userData) {
        return this._request('POST', `/users/${ type }`, { body: userData })
            .then(this._bindUser.bind(this));
    }

    _updateUser (userId, type, userData) {
        return this._request('PUT', `/users/${ type }/${ userId }`, { body: userData })
            .then(this._bindUser.bind(this));
    }

    _listUserCards (userId, opts) {
        return this._request('GET', `/users/${ userId }/cards`, { qs: opts })
            .map(this._bindCard.bind(this));
    }

    _listUserWallets (userId, opts) {
        return this._request('GET', `/users/${ userId }/wallets`, { qs: opts })
            .map(this._bindWallet.bind(this));
    }

    _listUserTransactions (userId, opts) {
        return this._request('GET', `/users/${ userId }/transactions`, { qs: opts });
    }

    _listUserBankAccounts (userId, opts) {
        return this._request('GET', `/users/${ userId }/bankaccounts`, { qs: opts })
            .map(_.bind(this._bindBankAccount, this, _, userId));
    }

    _getUserBankAccount (userId, bankAccountId) {
        return this._request('GET', `/users/${ userId }/bankaccounts/${ bankAccountId }`)
            .then(_.bind(this._bindBankAccount, this, _, userId));
    }

    _createUserBankAccount (userId, type, bankAccountData) {
        return this._request('POST', `/users/${ userId }/bankaccounts/${ type }`, { body: bankAccountData })
            .then(_.bind(this._bindBankAccount, this, _, userId));
    }

    _listWallets (opts) {
        return this._request('GET', '/wallets', { qs: opts })
            .map(this._bindWallet.bind(this));
    }

    _getWallet (walletId) {
        return this._request('GET', `/wallets/${ walletId }`)
            .then(this._bindWallet.bind(this));
    }

    _createWallet (walletData) {
        return this._request('POST', '/wallets', { body: walletData })
            .then(this._bindWallet.bind(this));
    }

    _updateWallet (walletId, walletData) {
        return this._request('PUT', `/wallets/${ walletId }`, { body: walletData })
            .then(this._bindWallet.bind(this));
    }

    _listWalletTransactions (walletId, opts) {
        return this._request('GET', `/wallets/${ walletId }/transactions`, { qs: opts });
    }

    _listPayIns (opts) {
        return this._request('GET', '/payins', { qs: opts })
            .map(this._bindPayIn.bind(this));
    }

    _getPayIn (payInId) {
        return this._request('GET', `/payins/${ payInId }`)
            .then(this._bindPayIn.bind(this));
    }

    _createPayIn (method, type) {
        return this._request('POST', `/payins/${ method }/${ type }`);
    }

    _getCardRegistration (cardRegistrationId) {
        return this._request('GET', `/cardregistration/${ cardRegistrationId }`)
            .then(this._bindCardRegistration.bind(this));
    }

    _createCardRegistration (cardRegistrationData) {
        return this._request('POST', '/cardregistration', { body: cardRegistrationData })
            .then(this._bindCardRegistration.bind(this));
    }

    _updateCardRegistration (cardRegistrationId, cardRegistrationData) {
        return this._request('PUT', `/cardregistration/${ cardRegistrationId }`, { body: cardRegistrationData })
            .then(this._bindCardRegistration.bind(this));
    }

    _getTransfer (transferId) {
        return this._request('GET', `/transfers/${ transferId }`)
            .then(this._bindTransfer.bind(this));
    }

    _createTransfer (transferData) {
        return this._request('POST', `/transfers`, { body: transferData })
            .then(this._bindTransfer.bind(this));
    }

    _listUserKYCDocuments (userId, opts) {
        return this._request('GET', `/users/${ userId }/KYC/documents`, { qs: opts })
            .map(_.bind(this._bindKycDocument, this, _, userId));
    }

    _getUserKYCDocument (userId, documentId) {
        return this._request('GET', `/users/${ userId }/KYC/documents/${ documentId }`)
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _createUserKYCDocument (userId, documentData) {
        return this._request('POST', `/users/${ userId }/KYC/documents`, { body: documentData })
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _listKYCDocuments (opts) {
        return this._request('GET', `/KYC/documents`, { qs: opts })
            .map(this._bindKycDocument.bind(this));
    }

    _getKYCDocument (documentId) {
        return this._request('GET', `/KYC/documents/${ documentId }`)
            .then(this._bindKycDocument.bind(this));
    }

    _updateUserKYCDocument (userId, documentId, documentData) {
        return this._request('PUT', `/users/${ userId }/KYC/documents/${ documentId }`, { body: documentData })
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _createUserKYCDocumentPage (userId, documentId, pageData) {
        return this._request('POST', `/users/${ userId }/KYC/documents/${ documentId }/pages`, { body: pageData });
    }

    _getCard (cardId) {
        return this._request('GET', `/cards/${ cardId }`)
            .then(this._bindCard.bind(this));
    }

    _updateCard (cardId, cardData) {
        return this._request('PUT', `/cards/${ cardId }`, { body: cardData })
            .then(this._bindCard.bind(this));
    }

    _getPayOut (payoutId) {
        return this._request('GET', `/payouts/${ payoutId }`)
            .then(this._bindPayOut.bind(this));
    }

    _createBankWirePayout (banWirePayoutData) {
        return this._request('POST', '/payouts/bankwire', { body: banWirePayoutData })
            .then(this._bindPayOut.bind(this));
    }

    _createTransferRefund (transferId, transferData) {
        return this._request('POST', `/transfers/${ transferId }/refunds`, { body: transferData })
            .then(this._bindTransfer.bind(this));
    }

    _createPayInRefund (payInId, refundData) {
        return this._request('POST', `/payins/${ payInId }/refunds`, { body: refundData })
            .then(this._bindRefund.bind(this));
    }

    _getRefund (refundId) {
        return this._request('GET', `/refunds/${ refundId }`)
            .then(this._bindRefund.bind(this));
    }

    _getPreauthorization (preauthorizationId) {
        return this._request('GET', `/preauthorizations/${ preauthorizationId }`)
            .then(this._bindPreauthorization.bind(this));
    }

    _updatePreauthorization (preauthorizationId, preauthorizationData) {
        return this._request('PUT', `/preauthorizations/${ preauthorizationId }`, { body: preauthorizationData })
            .then(this._bindPreauthorization.bind(this));
    }

    _createDirectCardPreauthorization (preauthorizationData) {
        return this._request('POST', '/preauthorizations/card/direct', { body: preauthorizationData })
            .then(this._bindPreauthorization.bind(this));
    }

    _createDirectBankWirePayIn (payInData) {
        return this._request('POST', '/payins/bankwire/direct', { body: payInData })
            .then(this._bindPayIn.bind(this));
    }

    _createWebDirectDebitPayIn (payInData) {
        return this._request('POST', '/payins/directdebit/web', { body: payInData })
            .then(this._bindPayIn.bind(this));
    }

    _createDirectPreAuthorizedPayIn (payInData) {
        return this._request('POST', '/payins/PreAuthorized/direct', { body: payInData })
            .then(this._bindPayIn.bind(this));
    }

    _createDirectCardPayIn (payInData) {
        return this._request('POST', '/payins/card/direct', { body: payInData })
            .then(this._bindPayIn.bind(this));
    }

    _createWebCardPayIn (payInData) {
        return this._request('POST', '/payins/card/web', { body: payInData })
            .then(this._bindPayIn.bind(this));
    }

    _listDisputes (opts) {
        return this._request('GET', '/disputes', { qs: opts })
            .map(this._bindDispute.bind(this));
    }

    _getDispute (disputeId) {
        return this._request('GET', `/disputes/${ disputeId }`)
            .then(this._bindDispute.bind(this));
    }

    _updateDispute (disputeId, disputeData) {
        return this._request('PUT', `/disputes/${ disputeId }`, { body: disputeData })
            .then(this._bindDispute.bind(this));
    }

    _closeDispute (disputeId) {
        return this._request('PUT', `/disputes/${ disputeId }/close`)
            .then(this._bindDispute.bind(this));
    }

    _contestDispute (disputeId, disputeData) {
        return this._request('PUT', `/disputes/${ disputeId }/submit`, { body: disputeData })
            .then(this._bindDispute.bind(this));
    }

    _submitDispute (disputeId) {
        return this._request('PUT', `/disputes/${ disputeId }/submit`)
            .then(this._bindDispute.bind(this));
    }

}

module.exports = Mangopay;