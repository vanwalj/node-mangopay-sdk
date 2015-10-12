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

### mangopay

### user

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