# node-mangopay-sdk
Non official node mangopay SDK, promise flavoured.

**Warning ⚠️ : Currently under active development, subject to API changes**

## Install

`$> npm install mangopay-sdk --save`

## Usage

``` js
const Mangopay = require('mangopay-sdk');

const mangopay = new Mangopay('username', 'password');

mangopay.User.list()
    .then(function (users) {
        return users[0].Card.list();
    }).then(function (cards) {
        return cards[0].update({
            RegistrationData: ''
        });
    }).then(function (card) {
        console.log('First user, first card updated !');
    });

```

## API

### Mangopay
* `Mangopay.errors -> [MangopayError]`
* `new Mangopay(clientId, passPhrase) -> mangopay`

### mangopay
#### mangopay.Event
* `mangopay.Event.list() -> Promise<[event]>`

#### mangopay.User
* `mangopay.User.get(userId) -> Promise<user>`
* `mangopay.User.list(Pagination) -> Promise<[user]>`
* `mangopay.User.Natural.create(userData) -> Promise<user>`
* `mangopay.User.Legal.create(userData) -> Promise<user>`
* `mangopay.User.Natural.update(userId, userData) -> Promise<user>`
* `mangopay.User.Legal.update(userId, userData) -> Promise<user>`

#### mangopay.Wallet
* `mangopay.Wallet.get(walletId) -> Promise<wallet>`
* `mangopay.Wallet.create(walletData) -> Promise<wallet>`
* `mangopay.Wallet.update(walletId, walletData) -> Promise<wallet>`

#### mangopay.CardRegistration
* `mangopay.CardRegistration.get(cardRegistrationId) -> Promise<cardRegistration>`
* `mangopay.CardRegistration.create(cardRegistrationData) -> Promise<cardRegistration>`

#### mangopay.PayIns
* `mangopay.PayIn.get(payInId) -> Promise<payIn>`
* `mangopay.PayIn.list(Pagination) -> Promise<[payIn]>`
* `mangopay.PayIn.create(payInData) -> Promise<payIn>`

#### mangopay.PayIn.BankWire.Direct
* `mangopay.PayIn.BankWire.Direct.create(directBankWirePayInData) -> Promise<payIn>`

#### mangopay.PayIn.DirectDebit.Web
* `mangopay.PayIn.DirectDebit.Web.create(webDirectDebitPayInData) -> Promise<payIn>`

#### mangopay.PayIn.PreAuthorized.Direct
* `mangopay.PayIn.PreAuthorized.Direct.create(directPreAuthorizedPayInData) -> Promise<payIn>`

#### mangopay.PayIn.Card.Direct
* `mangopay.PayIn.Card.Direct.create(directCardPayInData) -> Promise<payIn>`

#### mangopay.PayIn.Card.Web
* `mangopay.PayIn.Card.Web.create(webCardPayInData) -> Promise<payIn>`

### mangopay.Transfer
* `mangopay.Transfer.get(transferId) -> Promise<transfer>`
* `mangopay.Transfer.create(transferData) -> Promise<transfer>`

### mangopay.KYC.Document
* `mangopay.KYC.Document.get(documentId) -> Promise<document>`
* `mangopay.KYC.Document.list(Pagination) -> Promise<[document]>`

### mangopay.Card
* `mangopay.Card.get(cardId) -> Promise<card>`
* `mangopay.Card.update(cardId, cardData) -> Promise<card>`

### mangopay.PayOut
* `mangopay.PayOut.get(payOutId) -> Promise<payOut>`

### mangopay.PayOut.BankWire
* `mangopay.PayOut.BankWire.create(bankWirePayOutData) -> Promise<payOut>`

### mangopay.Refund
* `mangopay.Refund.get(refundId) -> Promise<refund>`

### mangopay.Preauthorization
* `mangopay.PreAuthorization.get(preAuthorizationId) -> Promise<preAuthorization>`
* `mangopay.PreAuthorization.update(preAuthorizationId, preAuthorizationData) -> Promise<preAuthorization>`

### mangopay.Preauthorization.Card.Direct
* `mangopay.PreAuthorization.Card.Direct.create(directCardPreAuthorizationData) -> Promise<preAuthorization>`

### mangopay.Dispute
* `mangopay.Dispute.get(disputeId) -> Promise<dispute>`
* `mangopay.Dispute.list(Pagination) -> Promise<[dispute]>`
* `mangopay.Dispute.update(disputeId, disputeData) -> Promise<dispute>`
* `mangopay.Dispute.close(disputeId) -> Promise<dispute>`
* `mangopay.Dispute.contest(disputeId) -> Promise<dispute>`
* `mangopay.Dispute.reSubmit(disputeId, disputeData) -> Promise<dispute>`

### mangopay.Hook
* `mangopay.Hook.get(hookId) -> Promise<hook>`
* `mangopay.Hook.list(Pagination) -> Promise<[hook]>`
* `mangopay.Hook.update(hookId, hookData) -> Promise<hook>`
* `mangopay.Hook.create(hookData) -> Promise<hook>`


### user
* `user.update(userData) -> Promise<user>`
* `user.reload() -> Promise<user>`
* `user.Card.list(Pagination) -> Promise<[card]>`
* `user.Wallet.create(data) -> Promise<[wallet]>`
* `user.Wallet.list(Pagination) -> Promise<[wallet]>`
* `user.Transaction.list(Pagination) -> Promise<[transaction]>`
* `user.BankAccount.list(Pagination) -> Promise<[bankAccount]>`
* `user.BankAccount.create(bankAccountData) -> Promise<bankAccount>`
* `user.KYC.Document.list() -> Promise<[document]>`
* `user.KYC.Document.create(documentKYCData) -> Promise<document>`

### wallet
* `wallet.reload() -> Promise<wallet>`
* `wallet.Transaction.list(Pagination) -> Promise<[wallet]>`

### kycDocument
* `kycDocument.update(data) -> Promise<kycDocument>`
* `kycDocument.reload() -> Promise<kycDocument>`
* `kycDocument.Page.create(data) -> Promise<kycDocumentPage>`

### cardRegistration
* `cardRegistration.update(data) -> Promise<cardRegistration>`
* `cardRegistration.reload() -> Promise<cardRegistration>`

### card
* `card.update(data) -> Promise<card>`
* `card.reload() -> Promise<card>`

### transfer
* `transfer.Refund.create(data) -> Promise<refund>`
* `transfer.reload() -> Promise<transfer>`

### bankAccount
* `bankAccount.reload() -> Promise<bankAccount>`

### payOut
* `payOut.reload() -> Promise<payOut>`

### payIn
* `payIn.reload() -> Promise<payIn>`
* `payIn.Refund.create() -> Promise<refund>`

### refund
* `refund.reload() -> Promise<refund>`

### dispute
* `dispute.reload() -> Promise<dispute>`
* `dispute.update(data) -> Promise<dispute>`
* `dispute.close() -> Promise<dispute>`
* `dispute.contest(data) -> Promise<dispute>`
* `dispute.submit() -> Promise<dispute>`

### preAuthorization
* `preAuthorization.reload() -> Promise<preAuthorization>`
* `preAuthorization.update(data) -> Promise<preAuthorization>`

### hook
* `hook.reload() -> Promise<hook>`
* `hook.update(data) -> Promise<hook>`
