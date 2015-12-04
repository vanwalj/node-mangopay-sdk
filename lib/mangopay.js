'use strict';

const assert = require('assert');

const Promise = require('bluebird');
const _ = require('lodash');
const request = require('request');

const constants = require('./constants');
const config = require('./config');
const validator = require('./validator');
const validationSchemas = require('./validation-schemas');
const _errors = require('./errors');

const _request = Promise.promisify(request, { multiArgs: true });
const _requestPost = Promise.promisify(request.post, { multiArgs: true, context: request });

class Mangopay {

    static get constants () {
        return constants;
    }

    static get errors () {
        return _errors.errors;
    }

    constructor (username, password, opts) {
        assert(_.includes(_.values(constants.API_VERSION), opts.apiVersion), 'Unsupported API Version');
        assert(username && password, 'Please specify mangopay username and password');
        this.config = Object.assign({}, config, opts);
        if (!this.config.production) {
            this.config.mangopayApiUrl = this.config.mangopaySandboxApiUrl;
        }
        this._validationSchemas = validationSchemas[this.config.apiVersion];
        this._username = username;
        this._password = password;

        this.Event = {
            list: this._listEvents.bind(this)
        };

        this.User = {
            get: this._getUser.bind(this),
            list: this._listUsers.bind(this),
            create: this._createUser.bind(this),
            update: this._updateUser.bind(this)
        };

        this.Wallet = {
            get: this._getWallet.bind(this),
            list: this._listWallets.bind(this),
            create: this._createWallet.bind(this),
            update: this._updateWallet.bind(this)
        };

        this.CardRegistration = {
            get: this._getCardRegistration.bind(this),
            create: this._createCardRegistration.bind(this)
        };

        this.PayIn = {
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

        this.Transfer = {
            get: this._getTransfer.bind(this),
            create: this._createTransfer.bind(this)
        };

        this.KYC = {
            Document: {
                get: this._getKYCDocument.bind(this),
                list: this._listKYCDocuments.bind(this)
            }
        };

        this.Card = {
            get: this._getCard.bind(this),
            update: this._updateCard.bind(this)
        };

        this.PayOut = {
            get: this._getPayOut.bind(this),
            BankWire: {
                create: this._createBankWirePayout.bind(this)
            }
        };

        this.Refund = {
            get: this._getRefund.bind(this)
        };

        this.Preauthorization = {
            get: this._getPreauthorization,
            update: this._updatePreauthorization,
            Card: {
                Direct: {
                    create: this._createDirectCardPreauthorization.bind(this)
                }
            }
        };

        this.Dispute = {
            get: this._getDispute.bind(this),
            list: this._listDisputes.bind(this),
            update: this._updateDispute.bind(this),
            close: this._closeDispute.bind(this),
            contest: this._contestDispute.bind(this),
            reSubmit: this._submitDispute.bind(this)
        };
    }

    _connect () {
        return _requestPost(`${ this.config.mangopayApiUrl }/${ this.config.apiVersion }/oauth/token`, {
            json: true,
            auth: {
                user: this._username,
                pass: this._password
            },
            body: { grant_type: 'client_credentials' }
        }).spread((response, body) => {
            if (response.statusCode !== 200) {
                throw new Error('Mangopay API Connection failure');
            }
            this.bearer = body['access_token'];
            return this;
        });
    }

    _request (method, path, opts) {
        opts = opts || {};

        if (!this.bearer) {
            // Not connected yet, connect then replay request
            return this._connect()
                .then(mangopay => mangopay._request.apply(mangopay, arguments));
        }

        return _request({ method, uri: `${ this.config.mangopayApiUrl }/${ this.config.apiVersion }/${ this._username }/${ path }`,
                qs: opts.qs, body: opts.body, json: true,
                auth: { bearer: this.bearer }
            })
            .spread((response, body) => {
                if (response.statusCode === 401) {
                    // Token expired, connect then replay request
                    return this._connect()
                        .then(mangopay => mangopay._request.apply(mangopay, arguments));
                }
                if (response.statusCode >= 400 && response.statusCode < 500) {
                    const dedicatedError = _errors.types[body['Type']];
                    if (dedicatedError) {
                        throw new dedicatedError(body['Message'], body);
                    }
                    throw new _errors.errors.MangopayError(`Mangopay client error: ${ body['Message'] }`, body);
                }
                if (response.statusCode >= 500) {
                    throw new _errors.errors.InternalServerError();
                }
                return body;
            });
    }

    _bindUser (user) {

        user.update = this._updateUser.bind(this, user.Id, user.LegalPersonType ? 'legal' : 'natural');
        user.reload = this._getUser.bind(this, user.Id);

        user.Card = {
            list: this._listUserCards.bind(this, user.Id)
        };
        user.Wallet = {
            create: (opts) => this._createWallet(this, Object.assign({ Owners: [user.Id] }, opts)),
            list: this._listUserWallets.bind(this, user.Id)
        };
        user.Transaction = {
            list: this._listUserTransactions.bind(this, user.Id)
        };
        user.BankAccount = {
            list: this._listUserBankAccounts.bind(this, user.Id),
            create: this._createUserBankAccount.bind(this, user.Id)
        };
        user.KYC = {
            Documents: {
                list: this._listUserKYCDocuments.bind(this, user.Id),
                create: this._createUserKYCDocument.bind(this, user.Id)
            }
        };

        return user;
    }

    _bindWallet (wallet) {
        wallet.reload = this._getWallet.bind(this, wallet.Id);

        wallet.Transaction = {
            list: this._listWalletTransactions.bind(this, wallet.Id)
        };

        return wallet;
    }

    _bindKycDocument (document, userId) {
        if (userId) {
            document.update = this._updateUserKYCDocument.bind(this, userId, document);
            document.reload = this._getUserKYCDocument.bind(this, userId, document.Id);
            document.Page = {
                create: this._createUserKYCDocumentPage.bind(this, userId, document.Id)
            };
        } else {
            document.reload = this._getKYCDocument.bind(this, document.Id);
        }

        return document;
    }

    _bindCardRegistration (cardRegistration) {
        cardRegistration.update = this._updateCardRegistration.bind(this, cardRegistration.Id);
        cardRegistration.reload = this._getCardRegistration.bind(this, cardRegistration.Id);

        return cardRegistration;
    }

    _bindCard (card) {
        card.update = this._updateCard.bind(this, card.Id);
        card.reload = this._getCard.bind(this, card.Id);

        return card;
    }

    _bindTransfer (transfer) {
        transfer.reload = this._getTransfer.bind(this, transfer.Id);
        transfer.Refund = {
            create: this._createTransferRefund.bind(this, transfer.Id)
        };

        return transfer;
    }

    _bindBankAccount (bankAccount, userId) {
        bankAccount.reload = this._getUserBankAccount.bind(this, userId, bankAccount.Id);

        return bankAccount;
    }

    _bindPayOut (payOut) {
        payOut.reload = this._getPayOut.bind(this, payOut.Id);

        return payOut;
    }

    _bindPayIn (payIn) {
        payIn.reload = this._getPayIn.bind(this, payIn.Id);
        payIn.Refund = {
            create: this._createPayInRefund.bind(this, payIn.Id)
        };

        return payIn;
    }

    _bindRefund (refund) {
        refund.reload = this._getRefund.bind(this, refund.Id);

        return refund;
    }

    _bindDispute (dispute) {
        dispute.reload = this._getDispute.bind(this, dispute.Id);
        dispute.update = this._updateDispute.bind(this, dispute.Id);
        dispute.close = this._closeDispute.bind(this, dispute.Id);
        dispute.contest = this._contestDispute.bind(this, dispute.Id);
        dispute.submit = this._submitDispute.bind(this, dispute.Id);

        return dispute;
    }

    _bindPreauthorization (preauthorization) {
        preauthorization.reload = this._getPreauthorization.bind(this, preauthorization.Id);
        preauthorization.update = this._updatePreauthorization.bind(this, preauthorization.Id);

        return preauthorization;
    }

    _listEvents (opts) {
        return this._request('GET', 'events', { qs: opts });
    }

    _listUsers (opts) {
        return this._request('GET', 'users', { qs: opts })
            .map(this._bindUser.bind(this));
    }

    _getUser (userId) {
        return this._request('GET', `users/${ userId }`)
            .then(this._bindUser.bind(this));
    }

    _createUser (type, _userData) {
        return validator(type, this._validationSchemas.userType)
            .then(() => validator(_userData, this._validationSchemas.createNaturalUser))
            .then(userData => this._request('POST', `users/${ type }`, { body: userData }))
            .then(this._bindUser.bind(this));
    }

    _updateUser (userId, type, _userData) {
        return validator(type, this._validationSchemas.userType)
            .then(() => validator(_userData, this._validationSchemas.updateNaturalUser))
            .then(userData => this._request('PUT', `users/${ type }/${ userId }`, { body: userData }))
            .then(this._bindUser.bind(this));
    }

    _listUserCards (userId, opts) {
        return this._request('GET', `users/${ userId }/cards`, { qs: opts })
            .map(this._bindCard.bind(this));
    }

    _listUserWallets (userId, opts) {
        return this._request('GET', `users/${ userId }/wallets`, { qs: opts })
            .map(this._bindWallet.bind(this));
    }

    _listUserTransactions (userId, opts) {
        return this._request('GET', `users/${ userId }/transactions`, { qs: opts });
    }

    _listUserBankAccounts (userId, opts) {
        return this._request('GET', `users/${ userId }/bankAccounts`, { qs: opts })
            .map(_.bind(this._bindBankAccount, this, _, userId));
    }

    _getUserBankAccount (userId, bankAccountId) {
        return this._request('GET', `users/${ userId }/bankAccounts/${ bankAccountId }`)
            .then(_.bind(this._bindBankAccount, this, _, userId));
    }

    _createUserBankAccount (userId, type, _bankAccountData) {
        return validator(type, this._validationSchemas.bankAccountType)
            .then(() => validator(_bankAccountData, this._validationSchemas.createUserBankAccount[type]))
            .then(bankAccountData => this._request('POST', `users/${ userId }/bankAccounts/${ type }`, { body: bankAccountData }))
            .then(_.bind(this._bindBankAccount, this, _, userId));
    }

    _listWallets (opts) {
        return this._request('GET', 'wallets', { qs: opts })
            .map(this._bindWallet.bind(this));
    }

    _getWallet (walletId) {
        return this._request('GET', `wallets/${ walletId }`)
            .then(this._bindWallet.bind(this));
    }

    _createWallet (_walletData) {
        return validator(_walletData, this._validationSchemas.createWallet)
            .then(walletData => this._request('POST', 'wallets', { body: walletData }))
            .then(this._bindWallet.bind(this));
    }

    _updateWallet (walletId, _walletData) {
        return validator(_walletData, this._validationSchemas.createWallet)
            .then((walletData) => this._request('PUT', `wallets/${ walletId }`, { body: walletData }))
            .then(this._bindWallet.bind(this));
    }

    _listWalletTransactions (walletId, opts) {
        return this._request('GET', `wallets/${ walletId }/transactions`, { qs: opts });
    }

    _listPayIns (opts) {
        return this._request('GET', 'payIns', { qs: opts })
            .map(this._bindPayIn.bind(this));
    }

    _getPayIn (payInId) {
        return this._request('GET', `payIns/${ payInId }`)
            .then(this._bindPayIn.bind(this));
    }

    _createPayIn (method, type, payInData) {
        return this._request('POST', `payIns/${ method }/${ type }`, { body: payInData });
    }

    _getCardRegistration (cardRegistrationId) {
        return this._request('GET', `cardRegistration/${ cardRegistrationId }`)
            .then(this._bindCardRegistration.bind(this));
    }

    _createCardRegistration (cardRegistrationData) {
        return this._request('POST', 'cardRegistration', { body: cardRegistrationData })
            .then(this._bindCardRegistration.bind(this));
    }

    _updateCardRegistration (cardRegistrationId, cardRegistrationData) {
        return this._request('PUT', `cardRegistration/${ cardRegistrationId }`, { body: cardRegistrationData })
            .then(this._bindCardRegistration.bind(this));
    }

    _getTransfer (transferId) {
        return this._request('GET', `transfers/${ transferId }`)
            .then(this._bindTransfer.bind(this));
    }

    _createTransfer (transferData) {
        return this._request('POST', `transfers`, { body: transferData })
            .then(this._bindTransfer.bind(this));
    }

    _listUserKYCDocuments (userId, opts) {
        return this._request('GET', `users/${ userId }/KYC/documents`, { qs: opts })
            .map(_.bind(this._bindKycDocument, this, _, userId));
    }

    _getUserKYCDocument (userId, documentId) {
        return this._request('GET', `users/${ userId }/KYC/documents/${ documentId }`)
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _createUserKYCDocument (userId, documentData) {
        return this._request('POST', `users/${ userId }/KYC/documents`, { body: documentData })
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _listKYCDocuments (opts) {
        return this._request('GET', `KYC/documents`, { qs: opts })
            .map(this._bindKycDocument.bind(this));
    }

    _getKYCDocument (documentId) {
        return this._request('GET', `KYC/documents/${ documentId }`)
            .then(this._bindKycDocument.bind(this));
    }

    _updateUserKYCDocument (userId, documentId, documentData) {
        return this._request('PUT', `users/${ userId }/KYC/documents/${ documentId }`, { body: documentData })
            .then(_.bind(this._bindKycDocument, this, _, userId));
    }

    _createUserKYCDocumentPage (userId, documentId, pageData) {
        return this._request('POST', `users/${ userId }/KYC/documents/${ documentId }/pages`, { body: pageData });
    }

    _getCard (cardId) {
        return this._request('GET', `cards/${ cardId }`)
            .then(this._bindCard.bind(this));
    }

    _updateCard (cardId, cardData) {
        return this._request('PUT', `cards/${ cardId }`, { body: cardData })
            .then(this._bindCard.bind(this));
    }

    _getPayOut (payoutId) {
        return this._request('GET', `payouts/${ payoutId }`)
            .then(this._bindPayOut.bind(this));
    }

    _createBankWirePayout (banWirePayoutData) {
        return this._request('POST', 'payouts/bankWire', { body: banWirePayoutData })
            .then(this._bindPayOut.bind(this));
    }

    _createTransferRefund (transferId, transferData) {
        return this._request('POST', `transfers/${ transferId }/refunds`, { body: transferData })
            .then(this._bindTransfer.bind(this));
    }

    _createPayInRefund (payInId, refundData) {
        return this._request('POST', `payIns/${ payInId }/refunds`, { body: refundData })
            .then(this._bindRefund.bind(this));
    }

    _getRefund (refundId) {
        return this._request('GET', `refunds/${ refundId }`)
            .then(this._bindRefund.bind(this));
    }

    _getPreauthorization (preAuthorizationId) {
        return this._request('GET', `preAuthorizations/${ preAuthorizationId }`)
            .then(this._bindPreauthorization.bind(this));
    }

    _updatePreauthorization (preAuthorizationId, preAuthorizationData) {
        return this._request('PUT', `preAuthorizations/${ preAuthorizationId }`, { body: preAuthorizationData })
            .then(this._bindPreauthorization.bind(this));
    }

    _createDirectCardPreauthorization (preauthorizationData) {
        return this._request('POST', 'preAuthorizations/card/direct', { body: preauthorizationData })
            .then(this._bindPreauthorization.bind(this));
    }

    _createDirectBankWirePayIn (payInData) {
        return this._createPayIn('bankWire', 'direct', payInData)
            .then(this._bindPayIn.bind(this));
    }

    _createWebDirectDebitPayIn (payInData) {
        return this._createPayIn('directDebit', 'web', payInData)
            .then(this._bindPayIn.bind(this));
    }

    _createDirectPreAuthorizedPayIn (payInData) {
        return this._createPayIn('preAuthorized', 'direct', payInData)
            .then(this._bindPayIn.bind(this));
    }

    _createDirectCardPayIn (payInData) {
        return this._createPayIn('card', 'direct', payInData)
            .then(this._bindPayIn.bind(this));
    }

    _createWebCardPayIn (payInData) {
        return this._createPayIn('card', 'web', payInData)
            .then(this._bindPayIn.bind(this));
    }

    _listDisputes (opts) {
        return this._request('GET', 'disputes', { qs: opts })
            .map(this._bindDispute.bind(this));
    }

    _getDispute (disputeId) {
        return this._request('GET', `disputes/${ disputeId }`)
            .then(this._bindDispute.bind(this));
    }

    _updateDispute (disputeId, disputeData) {
        return this._request('PUT', `disputes/${ disputeId }`, { body: disputeData })
            .then(this._bindDispute.bind(this));
    }

    _closeDispute (disputeId) {
        return this._request('PUT', `disputes/${ disputeId }/close`)
            .then(this._bindDispute.bind(this));
    }

    _contestDispute (disputeId, disputeData) {
        return this._request('PUT', `disputes/${ disputeId }/submit`, { body: disputeData })
            .then(this._bindDispute.bind(this));
    }

    _submitDispute (disputeId) {
        return this._request('PUT', `disputes/${ disputeId }/submit`)
            .then(this._bindDispute.bind(this));
    }

}

module.exports = Mangopay;