# node-mangopay-sdk
Non official node mangopay SDK, promise flavoured.

**Warning ⚠️ : Currently under active development**

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
* `mangopay.User.create(userType, userData) -> Promise<user>`
* `mangopay.User.update(userType, userId, userData) -> Promise<user>`

#### mangopay.Wallet
* `mangopay.Wallet.get(walletId) -> Promise<wallet>`
* `mangopay.Wallet.list(Pagination) -> Promise<[wallet]>`
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
* `mangopay.Preauthorization.get(preauthorizationId) -> Promise<preauthorization>`
* `mangopay.Preauthorization.update(preauthorizationId, preauthorizationData) -> Promise<preauthorization>`

### mangopay.Preauthorization.Card.Direct
* `mangopay.Preauthorization.Card.Direct.create(directCardPreauthorizationData) -> Promise<preauthorization>`

### mangopay.Dispute
* `mangopay.Dispute.get(disputeId) -> Promise<dispute>`
* `mangopay.Dispute.list(Pagination) -> Promise<[dispute]>`
* `mangopay.Dispute.update(disputeId, disputeData) -> Promise<dispute>`
* `mangopay.Dispute.close(disputeId) -> Promise<dispute>`
* `mangopay.Dispute.contest(disputeId) -> Promise<dispute>`
* `mangopay.Dispute.reSubmit(disputeId, disputeData) -> Promise<dispute>`

### user
* `user.update(userData) -> Promise<user>`

### user.Cards
* `user.Card.list(Pagination) -> Promise<[cards]>`

### user.Wallets
* `user.Wallet.list(Pagination) -> Promise<[wallets]>`

### user.Transactions
* `user.Transaction.list(Pagination) -> Promise<[transaction]>`

### user.BankAccounts
* `user.BankAccount.list(Pagination) -> Promise<[bankAccount]>`
* `user.BankAccount.create(bankAccountData) -> Promise<bankAccount>`

### user.KYC.Documents
* `user.KYC.Document.list() -> Promise<[document]>`
* `user.KYC.Document.create(documentKYCData) -> Promise<document>`

### wallet

### kycDocument

### cardRegistration

### card

### transfer

### bankAccount

### payOut

### payIn

### refund

### dispute

### preauthorization