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
#### mangopay.Events
* `mongopay.Events.list() -> Promise([event])`

#### mangopay.Users
* `mongopay.Users.get(userId) -> Promise(user)`
* `mongopay.Users.list(Pagination) -> Promise([user])`
* `mongopay.Users.create(userType, userData) -> Promise(user)`
* `mongopay.Users.update(userType, userId, userData) -> Promise(user)`

#### mangopay.Wallets
* `mongopay.Wallets.get(walletId) -> Promise(wallet)`
* `mongopay.Wallets.list(Pagination) -> Promise([wallet])`
* `mongopay.Wallets.create(walletData) -> Promise(wallet)`
* `mongopay.Wallets.update(walletId, walletData) -> Promise(wallet)`

#### mangopay.CardRegistrations
* `mongopay.CardRegistrations.get(cardRegistrationId) -> Promise(cardRegistration)`
* `mongopay.CardRegistrations.create(cardRegistrationData) -> Promise(cardRegistration)`

#### mangopay.PayIns
* `mongopay.PayIns.get(payInId) -> Promise(payIn)`
* `mongopay.PayIns.list(Pagination) -> Promise([payIn])`
* `mongopay.PayIns.create(payInData) -> Promise(payIn)`

#### mangopay.PayIns.BankWire.Direct
* `mangopay.PayIns.BankWire.Direct.create(directBankWirePayInData) -> Promise(payIn)`

#### mangopay.PayIns.DirectDebit.Web
* `mangopay.PayIns.DirectDebit.Web.create(webDirectDebitPayInData) -> Promise(payIn)`

#### mangopay.PayIns.PreAuthorized.Direct
* `mangopay.PayIns.PreAuthorized.Direct.create(directPreAuthorizedPayInData) -> Promise(payIn)`

#### mangopay.PayIns.Card.Direct
* `mangopay.PayIns.Card.Direct.create(directCardPayInData) -> Promise(payIn)`

#### mangopay.PayIns.Card.Web
* `mangopay.PayIns.Card.Web.create(webCardPayInData) -> Promise(payIn)`

### mangopay.Transfers
* `mongopay.Transfers.get(transferId) -> Promise(transfer)`
* `mongopay.Transfers.create(transferData) -> Promise(transfer)`

### mangopay.KYCs.Documents
* `mongopay.KYCs.Documents.get(documentId) -> Promise(document)`
* `mongopay.KYCs.Documents.list(Pagination) -> Promise([document])`

### mangopay.Cards
* `mongopay.Cards.get(cardId) -> Promise(card)`
* `mongopay.Cards.update(cardId, cardData) -> Promise(card)`

### mangopay.PayOuts
* `mongopay.PayOuts.get(payOutId) -> Promise(payOut)`

### mangopay.PayOuts.BankWire
* `mongopay.PayOuts.BankWire.create(bankWirePayOutData) -> Promise(payOut)`

### mangopay.Refunds
* `mongopay.Refunds.get(refundId) -> Promise(refund)`

### mangopay.Preauthorizations
* `mongopay.Preauthorizations.get(preauthorizationId) -> Promise(preauthorization)`
* `mongopay.Preauthorizations.update(preauthorizationId, preauthorizationData) -> Promise(preauthorization)`

### mangopay.Preauthorizations.Card.Direct
* `mongopay.Preauthorizations.Card.Direct.create(directCardPreauthorizationData) -> Promise(preauthorization)`

### mangopay.Disputes
* `mongopay.Disputes.get(disputeId) -> Promise(dispute)`
* `mongopay.Disputes.list(Pagination) -> Promise([dispute])`
* `mongopay.Disputes.update(disputeId, disputeData) -> Promise(dispute)`
* `mongopay.Disputes.close(disputeId) -> Promise(dispute)`
* `mongopay.Disputes.contest(disputeId) -> Promise(dispute)`
* `mongopay.Disputes.reSubmit(disputeId, disputeData) -> Promise(dispute)`

### user
* `user.update(userData) -> Promise(user)`

### user.Cards
* `user.Cards.list(Pagination) -> Promise([cards])`

### user.Wallets
* `user.Wallets.list(Pagination) -> Promise([wallets])`

### user.Transactions
* `user.Transactions.list(Pagination) -> Promise([transaction])`

### user.BankAccounts
* `user.BankAccounts.list(Pagination) -> Promise([bankAccount])`
* `user.BankAccounts.create(bankAccountData) -> Promise(bankAccount)`

### user.KYCs.Documents
* `user.KYCs.Documents.list() -> Promise([document])`
* `user.KYCs.Documents.create(documentKYCData) -> Promise(document)`

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