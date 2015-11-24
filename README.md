# node-mangopay-sdk
Non official node mangopay SDK, promise flavoured.

**Warning ⚠️ : Not tested yet, currently under active development**

## Install

`$> npm install mangopay-sdk --save`

## Usage

``` js
const Mangopay = require('mangopay-sdk');

const mangopay = new Mangopay('username', 'password');

mangopay.users.get()
    .then(function (users) {
        return users[0].cards.get();
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
* `mongopay.Event.list() -> Promise([event])`

#### mangopay.User
* `mongopay.User.get(userId) -> Promise<user>`
* `mongopay.User.list(Pagination) -> Promise<[user]>`
* `mongopay.User.create(userType, userData) -> Promise<user>`
* `mongopay.User.update(userType, userId, userData) -> Promise<user>`

#### mangopay.Wallet
* `mongopay.Wallet.get(walletId) -> Promise<wallet>`
* `mongopay.Wallet.list(Pagination) -> Promise<[wallet]>`
* `mongopay.Wallet.create(walletData) -> Promise<wallet>`
* `mongopay.Wallet.update(walletId, walletData) -> Promise<wallet>`

#### mangopay.CardRegistration
* `mongopay.CardRegistration.get(cardRegistrationId) -> Promise<cardRegistration>`
* `mongopay.CardRegistration.create(cardRegistrationData) -> Promise<cardRegistration>`

#### mangopay.PayIns
* `mongopay.PayIn.get(payInId) -> Promise<payIn>`
* `mongopay.PayIn.list(Pagination) -> Promise<[payIn]>`
* `mongopay.PayIn.create(payInData) -> Promise<payIn>`

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
* `mongopay.Transfer.get(transferId) -> Promise<transfer>`
* `mongopay.Transfer.create(transferData) -> Promise<transfer>`

### mangopay.KYC.Document
* `mongopay.KYC.Document.get(documentId) -> Promise<document>`
* `mongopay.KYC.Document.list(Pagination) -> Promise<[document]>`

### mangopay.Card
* `mongopay.Card.get(cardId) -> Promise<card>`
* `mongopay.Card.update(cardId, cardData) -> Promise<card>`

### mangopay.PayOut
* `mongopay.PayOut.get(payOutId) -> Promise<payOut>`

### mangopay.PayOut.BankWire
* `mongopay.PayOut.BankWire.create(bankWirePayOutData) -> Promise<payOut>`

### mangopay.Refund
* `mongopay.Refund.get(refundId) -> Promise<refund>`

### mangopay.Preauthorization
* `mongopay.Preauthorization.get(preauthorizationId) -> Promise<preauthorization>`
* `mongopay.Preauthorization.update(preauthorizationId, preauthorizationData) -> Promise<preauthorization>`

### mangopay.Preauthorization.Card.Direct
* `mongopay.Preauthorization.Card.Direct.create(directCardPreauthorizationData) -> Promise<preauthorization>`

### mangopay.Dispute
* `mongopay.Dispute.get(disputeId) -> Promise<dispute>`
* `mongopay.Dispute.list(Pagination) -> Promise<[dispute]>`
* `mongopay.Dispute.update(disputeId, disputeData) -> Promise<dispute>`
* `mongopay.Dispute.close(disputeId) -> Promise<dispute>`
* `mongopay.Dispute.contest(disputeId) -> Promise<dispute>`
* `mongopay.Dispute.reSubmit(disputeId, disputeData) -> Promise<dispute>`

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