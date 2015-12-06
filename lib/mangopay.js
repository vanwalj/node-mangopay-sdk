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
        assert(username && password, 'Please specify mangopay username and password');
        this.config = Object.assign({}, config, opts);
        assert(_.includes(_.values(constants.API_VERSION), this.config.apiVersion), 'Unsupported API Version');
        if (!this.config.production) {
            this.config.mangopayApiUrl = this.config.mangopaySandboxApiUrl;
        }
        this._validationSchemas = validationSchemas[this.config.apiVersion];
        this._username = username;
        this._password = password;

        this.Event = {
            list: opts => this._listEvents(opts)
        };

        this.User = {
            get: id => this._getUser(id),
            list: opts => this._listUsers(opts),
            Natural: {
                create: data => this._createNaturalUser(data),
                update: (id, data) => this._updateNaturalUser(id, data)
            },
            Legal: {
                create: data => this._createLegalUser(data),
                update: (id, data) => this._updateLegalUser(id, data)
            }
        };

        this.Wallet = {
            get: id => this._getWallet(id),
            list: opts => this._listWallets(opts),
            create: data => this._createWallet(data),
            update: (id, data) => this._updateWallet(id, data)
        };

        this.CardRegistration = {
            get: id => this._getCardRegistration(id),
            create: data => this._createCardRegistration(data)
        };

        this.PayIn = {
            get: id => this._getPayIn(id),
            list: opts => this._listPayIns(opts),
            BankWire: {
                Direct: {
                    create: data => this._createDirectBankWirePayIn(data)
                }
            },
            DirectDebit: {
                Web: {
                    create: data => this._createWebDirectDebitPayIn(data)
                }
            },
            PreAuthorized: {
                Direct: {
                    create: data => this._createDirectPreAuthorizedPayIn(data)
                }
            },
            Card: {
                Direct: {
                    create: data => this._createDirectCardPayIn(data)
                },
                Web: {
                    create: data => this._createWebCardPayIn(data)
                }
            }
        };

        this.Transfer = {
            get: id => this._getTransfer(id),
            create: data => this._createTransfer(data)
        };

        this.KYC = {
            Document: {
                get: id => this._getKYCDocument(id),
                list: opts => this._listKYCDocuments(opts)
            }
        };

        this.Card = {
            get: id => this._getCard(id),
            update: (id, data) => this._updateCard(id, data)
        };

        this.PayOut = {
            get: id => this._getPayOut(id),
            BankWire: {
                create: data => this._createBankWirePayout(data)
            }
        };

        this.Refund = {
            get: id => this._getRefund(id)
        };

        this.Preauthorization = {
            get: id => this._getPreAuthorization(id),
            update: (id, data) => this._updatePreauthorization(id, data),
            Card: {
                Direct: {
                    create: data => this._createDirectCardPreauthorization(data)
                }
            }
        };

        this.Dispute = {
            get: id => this._getDispute(id),
            list: opts => this._listDisputes(opts),
            update: (id, data) => this._updateDispute(id, data),
            close: id => this._closeDispute(id),
            contest: (id, data) => this._contestDispute(id, data),
            reSubmit: id => this._submitDispute(id)
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
                throw new _errors.errors.ConnectionError('Mangopay API Connection failure');
            }
            this.bearer = body['access_token'];
            return this;
        });
    }

    _request (method, path, opts) {
        const _opts = opts || {};

        if (!this.bearer) {
            // Not connected yet, connect then replay request
            return this._connect()
                .then(mangopay => mangopay._request.apply(mangopay, arguments));
        }

        return _request({ method, uri: `${ this.config.mangopayApiUrl }/${ this.config.apiVersion }/${ this._username }/${ path }`,
                qs: _opts.qs, body: _opts.body, json: true,
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

        user.update = data => this._updateUser(user.Id, user.LegalPersonType ? constants.USER_TYPE.LEGAL : constants.USER_TYPE.NATURAL, data);
        user.reload = () => this._getUser(user.Id);

        user.Card = {
            list: opts => this._listUserCards(user.Id, opts)
        };
        user.Wallet = {
            create: data => this._createWallet(Object.assign({ Owners: [user.Id] }, data)),
            list: opts => this._listUserWallets(user.Id, opts)
        };
        user.Transaction = {
            list: opts => this._listUserTransactions(user.Id, opts)
        };
        user.BankAccount = {
            list: opts => this._listUserBankAccounts(user.Id, opts),
            create: (type, data) => this._createUserBankAccount(user.Id, type, data)
        };
        user.KYC = {
            Documents: {
                list: opts => this._listUserKYCDocuments(user.Id, opts),
                create: data => this._createUserKYCDocument(user.Id, data)
            }
        };

        return user;
    }

    _bindWallet (wallet) {
        wallet.reload = () => this._getWallet(wallet.Id);

        wallet.Transaction = {
            list: opts => this._listWalletTransactions(wallet.Id, opts)
        };

        return wallet;
    }

    _bindKycDocument (document, userId) {
        if (userId) {
            document.update = data => this._updateUserKYCDocument(userId, document.Id, data);
            document.reload = () => this._getUserKYCDocument(userId, document.Id);
            document.Page = {
                create: data => this._createUserKYCDocumentPage(userId, document.Id, data)
            };
        } else {
            document.reload = () => this._getKYCDocument(document.Id);
        }

        return document;
    }

    _bindCardRegistration (cardRegistration) {
        cardRegistration.update = data => this._updateCardRegistration(cardRegistration.Id, data);
        cardRegistration.reload = () => this._getCardRegistration(cardRegistration.Id);

        return cardRegistration;
    }

    _bindCard (card) {
        card.update = data => this._updateCard(card.Id, data);
        card.reload = () => this._getCard(card.Id);

        return card;
    }

    _bindTransfer (transfer) {
        transfer.reload = () => this._getTransfer(transfer.Id);
        transfer.Refund = {
            create: data => this._createTransferRefund(transfer.Id, data)
        };

        return transfer;
    }

    _bindBankAccount (bankAccount, userId) {
        bankAccount.reload = () => this._getUserBankAccount(userId, bankAccount.Id);

        return bankAccount;
    }

    _bindPayOut (payOut) {
        payOut.reload = () => this._getPayOut(payOut.Id);

        return payOut;
    }

    _bindPayIn (payIn) {
        payIn.reload = () => this._getPayIn(payIn.Id);
        payIn.Refund = {
            create: data => this._createPayInRefund(payIn.Id, data)
        };

        return payIn;
    }

    _bindRefund (refund) {
        refund.reload = () => this._getRefund(refund.Id);

        return refund;
    }

    _bindDispute (dispute) {
        dispute.reload = () => this._getDispute(dispute.Id);
        dispute.update = data => this._updateDispute(dispute.Id, data);
        dispute.close = () => this._closeDispute(dispute.Id);
        dispute.contest = data => this._contestDispute(dispute.Id, data);
        dispute.submit = () => this._submitDispute(dispute.Id);

        return dispute;
    }

    _bindPreAuthorization (preauthorization) {
        preauthorization.reload = () => this._getPreAuthorization(preauthorization.Id);
        preauthorization.update = data => this._updatePreauthorization(preauthorization.Id, data);

        return preauthorization;
    }

    _listEvents (opts) {
        return this._request('GET', 'events', { qs: opts });
    }

    _listUsers (opts) {
        return this._request('GET', 'users', { qs: opts })
            .map(user => this._bindUser(user));
    }

    _getUser (userId) {
        return this._request('GET', `users/${ userId }`)
            .then(user => this._bindUser(user));
    }

    _createUser (type, userData) {
        return this._request('POST', `users/${ type }`, { body: userData })
            .then(user => this._bindUser(user));
    }

    _createNaturalUser (_userData) {
        return validator(_userData, this._validationSchemas.createNaturalUser)
            .then(userData => this._createUser(constants.USER_TYPE.NATURAL, userData));
    }

    _createLegalUser (_userData) {
        return this._createUser(constants.USER_TYPE.LEGAL, _userData);
    }

    _updateUser (userId, type, userData) {
        return this._request('PUT', `users/${ type }/${ userId }`, { body: userData })
            .then(user => this._bindUser(user));
    }

    _updateNaturalUser (userId, _userData) {
        return validator(_userData, this._validationSchemas.updateNaturalUser)
            .then(userData => this._updateUser(userId, constants.USER_TYPE.NATURAL, { body: userData }));
    }

    _updateLegalUser (userId, _userData) {
        return this._updateUser(userId, constants.USER_TYPE.LEGAL, { body: _userData });
    }

    _listUserCards (userId, opts) {
        return this._request('GET', `users/${ userId }/cards`, { qs: opts })
            .map(card => this._bindCard(card));
    }

    _listUserWallets (userId, opts) {
        return this._request('GET', `users/${ userId }/wallets`, { qs: opts })
            .map(wallet => this._bindWallet(wallet));
    }

    _listUserTransactions (userId, opts) {
        return this._request('GET', `users/${ userId }/transactions`, { qs: opts });
    }

    _listUserBankAccounts (userId, opts) {
        return this._request('GET', `users/${ userId }/bankAccounts`, { qs: opts })
            .map(bankAccount => this._bindBankAccount(bankAccount, userId));
    }

    _getUserBankAccount (userId, bankAccountId) {
        return this._request('GET', `users/${ userId }/bankAccounts/${ bankAccountId }`)
            .then(bankAccount => this._bindBankAccount(bankAccount, userId));
    }

    _createUserBankAccount (userId, type, _bankAccountData) {
        return validator(type, this._validationSchemas.bankAccountType)
            .then(() => validator(_bankAccountData, this._validationSchemas.createUserBankAccount[type]))
            .then(bankAccountData => this._request('POST', `users/${ userId }/bankAccounts/${ type }`, { body: bankAccountData }))
            .then(bankAccount => this._bindBankAccount(bankAccount, userId));
    }

    _listWallets (opts) {
        return this._request('GET', 'wallets', { qs: opts })
            .map(wallet => this._bindWallet(wallet));
    }

    _getWallet (walletId) {
        return this._request('GET', `wallets/${ walletId }`)
            .then(wallet => this._bindWallet(wallet));
    }

    _createWallet (_walletData) {
        return validator(_walletData, this._validationSchemas.createWallet)
            .then(walletData => this._request('POST', 'wallets', { body: walletData }))
            .then(wallet => this._bindWallet(wallet));
    }

    _updateWallet (walletId, _walletData) {
        return validator(_walletData, this._validationSchemas.createWallet)
            .then(walletData => this._request('PUT', `wallets/${ walletId }`, { body: walletData }))
            .then(wallet => this._bindWallet(wallet));
    }

    _listWalletTransactions (walletId, opts) {
        return this._request('GET', `wallets/${ walletId }/transactions`, { qs: opts });
    }

    _listPayIns (opts) {
        return this._request('GET', 'payIns', { qs: opts })
            .map(payIn => this._bindPayIn(payIn));
    }

    _getPayIn (payInId) {
        return this._request('GET', `payIns/${ payInId }`)
            .then(payIn => this._bindPayIn(payIn));
    }

    _createPayIn (method, type, payInData) {
        return this._request('POST', `payIns/${ method }/${ type }`, { body: payInData })
            .then(payIn => this._bindPayIn(payIn));
    }

    _getCardRegistration (cardRegistrationId) {
        return this._request('GET', `cardRegistrations/${ cardRegistrationId }`)
            .then(cardRegistration => this._bindCardRegistration(cardRegistration));
    }

    _createCardRegistration (_cardRegistrationData) {
        return validator(_cardRegistrationData, this._validationSchemas.createCardRegistration)
            .then((cardRegistrationData) => this._request('POST', 'cardRegistrations', { body: cardRegistrationData }))
            .then(cardRegistration => this._bindCardRegistration(cardRegistration));
    }

    _updateCardRegistration (cardRegistrationId, _cardRegistrationData) {
        return validator(_cardRegistrationData, this._validationSchemas.updateCardRegistration)
            .then((cardRegistrationData) => this._request('PUT', `cardRegistrations/${ cardRegistrationId }`, { body: cardRegistrationData }))
            .then(cardRegistration => this._bindCardRegistration(cardRegistration));
    }

    _getTransfer (transferId) {
        return this._request('GET', `transfers/${ transferId }`)
            .then(transfer => this._bindTransfer(transfer));
    }

    _createTransfer (transferData) {
        return this._request('POST', `transfers`, { body: transferData })
            .then(transfer => this._bindTransfer(transfer));
    }

    _listUserKYCDocuments (userId, opts) {
        return this._request('GET', `users/${ userId }/KYC/documents`, { qs: opts })
            .map(kycDocument => this._bindKycDocument(kycDocument, userId));
    }

    _getUserKYCDocument (userId, documentId) {
        return this._request('GET', `users/${ userId }/KYC/documents/${ documentId }`)
            .then(kycDocument => this._bindKycDocument(kycDocument, userId));
    }

    _createUserKYCDocument (userId, documentData) {
        return this._request('POST', `users/${ userId }/KYC/documents`, { body: documentData })
            .then(kycDocument => this._bindKycDocument(kycDocument, userId));
    }

    _listKYCDocuments (opts) {
        return this._request('GET', `KYC/documents`, { qs: opts })
            .map(kycDocument => this._bindKycDocument(kycDocument));
    }

    _getKYCDocument (documentId) {
        return this._request('GET', `KYC/documents/${ documentId }`)
            .then(kycDocument => this._bindKycDocument(kycDocument));
    }

    _updateUserKYCDocument (userId, documentId, documentData) {
        return this._request('PUT', `users/${ userId }/KYC/documents/${ documentId }`, { body: documentData })
            .then(kycDocument => this._bindKycDocument(kycDocument, userId));
    }

    _createUserKYCDocumentPage (userId, documentId, pageData) {
        return this._request('POST', `users/${ userId }/KYC/documents/${ documentId }/pages`, { body: pageData });
    }

    _getCard (cardId) {
        return this._request('GET', `cards/${ cardId }`)
            .then(card => this._bindCard(card));
    }

    _updateCard (cardId, cardData) {
        return this._request('PUT', `cards/${ cardId }`, { body: cardData })
            .then(card => this._bindCard(card));
    }

    _getPayOut (payoutId) {
        return this._request('GET', `payouts/${ payoutId }`)
            .then(card => this._bindPayOut(card));
    }

    _createBankWirePayout (banWirePayoutData) {
        return this._request('POST', 'payouts/bankWire', { body: banWirePayoutData })
            .then(payOut => this._bindPayOut(payOut));
    }

    _createTransferRefund (transferId, transferData) {
        return this._request('POST', `transfers/${ transferId }/refunds`, { body: transferData })
            .then(transfer => this._bindTransfer(transfer));
    }

    _createPayInRefund (payInId, refundData) {
        return this._request('POST', `payIns/${ payInId }/refunds`, { body: refundData })
            .then(refund => this._bindRefund(refund));
    }

    _getRefund (refundId) {
        return this._request('GET', `refunds/${ refundId }`)
            .then(refund => this._bindRefund(refund));
    }

    _getPreAuthorization (preAuthorizationId) {
        return this._request('GET', `preAuthorizations/${ preAuthorizationId }`)
            .then(PreAuthorization => this._bindPreAuthorization(preAuthorizationId));
    }

    _updatePreauthorization (preAuthorizationId, preAuthorizationData) {
        return this._request('PUT', `preAuthorizations/${ preAuthorizationId }`, { body: preAuthorizationData })
            .then(PreAuthorization => this._bindPreAuthorization(PreAuthorization));
    }

    _createDirectCardPreauthorization (preAuthorizationData) {
        return this._request('POST', 'preAuthorizations/card/direct', { body: preAuthorizationData })
            .then(PreAuthorization => this._bindPreAuthorization(PreAuthorization));
    }

    _createDirectBankWirePayIn (payInData) {
        return this._createPayIn('bankWire', 'direct', payInData);
    }

    _createWebDirectDebitPayIn (payInData) {
        return this._createPayIn('directDebit', 'web', payInData);
    }

    _createDirectPreAuthorizedPayIn (payInData) {
        return this._createPayIn('preAuthorized', 'direct', payInData);
    }

    _createDirectCardPayIn (payInData) {
        return this._createPayIn('card', 'direct', payInData);
    }

    _createWebCardPayIn (payInData) {
        return this._createPayIn('card', 'web', payInData);
    }

    _listDisputes (opts) {
        return this._request('GET', 'disputes', { qs: opts })
            .map(dispute => this._bindDispute(dispute));
    }

    _getDispute (disputeId) {
        return this._request('GET', `disputes/${ disputeId }`)
            .then(dispute => this._bindDispute(dispute));
    }

    _updateDispute (disputeId, disputeData) {
        return this._request('PUT', `disputes/${ disputeId }`, { body: disputeData })
            .then(dispute => this._bindDispute(dispute));
    }

    _closeDispute (disputeId) {
        return this._request('PUT', `disputes/${ disputeId }/close`)
            .then(dispute => this._bindDispute(dispute));
    }

    _contestDispute (disputeId, disputeData) {
        return this._request('PUT', `disputes/${ disputeId }/submit`, { body: disputeData })
            .then(dispute => this._bindDispute(dispute));
    }

    _submitDispute (disputeId) {
        return this._request('PUT', `disputes/${ disputeId }/submit`)
            .then(dispute => this._bindDispute(dispute));
    }

}

module.exports = Mangopay;