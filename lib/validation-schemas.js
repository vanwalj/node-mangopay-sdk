'use strict';

const _ = require('lodash');
const Joi = require('joi');

const countries = require('./countries.json');
const constants = require('./constants');

const alpha2CountryCodes = _.pluck(countries, ['alpha2Code']);
const currencyCodes = _(countries).pluck(['currencies']).flatten().uniq().value();
const incomeRanges = _.values(constants.INCOME_RANGE);
const userTypes = _.values(constants.USER_TYPE);
const bankAccountTypes = _.values(constants.BANK_ACCOUNT_TYPE);
const depositAccountTypes = _.values(constants.DEPOSIT_ACCOUNT_TYPE);

Joi.alpha2CountryCode = () => Joi.string().valid(alpha2CountryCodes);
Joi.currencyCode = () => Joi.string().valid(currencyCodes);
Joi.postalCode = () => Joi.string().regex(/^[a-zA-Z0-9]+$/);
Joi.numString = () => Joi.string().regex(/^[0-9]+$/);
Joi.incomeRange = () => Joi.string().valid(incomeRanges);
Joi.userType = () => Joi.string().valid(userTypes);
Joi.bankAccountType = () => Joi.string().valid(bankAccountTypes);
Joi.depositAccountType = () => Joi.string().valid(depositAccountTypes);

Joi.address = () => Joi.object().keys({
    AddressLine1: Joi.string().max(255),
    AddressLine2: Joi.string().max(255),
    City: Joi.string().max(255),
    Region: Joi.string().max(255),
    PostalCode: Joi.string(),
    Country: Joi.alpha2CountryCode()
});

Joi.naturalUser = () => Joi.object().keys({
    Tag: Joi.string().max(255),
    Email: Joi.string().email(),
    FirstName: Joi.string().max(100),
    LastName: Joi.string().max(100),
    Address: Joi.address(),
    Birthday: Joi.date(),
    Nationality: Joi.alpha2CountryCode(),
    CountryOfResidence: Joi.alpha2CountryCode(),
    Occupation: Joi.string().max(255),
    IncomeRange: Joi.incomeRange(),
    ProofOfIdentity: Joi.string(),
    ProofOfAddress: Joi.string()
});

Joi.createNaturalUser = () => Joi.naturalUser().requiredKeys(
    'Email', 'FirstName', 'LastName', 'Birthday', 'Nationality', 'CountryOfResidence',
    'Address.AddressLine1', 'Address.City', 'Address.Country'
);

Joi.bankAccount = () => Joi.object().keys({
    OwnerName: Joi.string(),
    OwnerAddress: Joi.address(),
    Tag: Joi.string()
});

Joi.bankAccountIBAN = () => Joi.bankAccount().concat(Joi.object().keys({
    IBAN: Joi.string(),
    BIC: Joi.string()
}));

Joi.bankAccountGB = () => Joi.bankAccount().concat(Joi.object().keys({
    AccountNumber: Joi.numString(),
    SortCode: Joi.numString().length(6)
}));

Joi.bankAccountUS = () => Joi.bankAccount().concat(Joi.object().keys({
    AccountNumber: Joi.numString(),
    ABA: Joi.numString().length(9),
    DepositAccountType: Joi.depositAccountType()
}));

Joi.bankAccountCA = () => Joi.bankAccount().concat(Joi.object().keys({
    BankName: Joi.string().alphanum().min(1).max(50),
    InstitutionNumber: Joi.numString().min(3).max(4),
    BranchCode: Joi.numString().length(5),
    AccountNumber: Joi.numString().min(1).max(20)
}));

Joi.bankAccountOther = () => Joi.bankAccount().concat(Joi.object().keys({
    Country: Joi.alpha2CountryCode(),
    BIC: Joi.string(),
    AccountNumber: Joi.string()
}));

Joi.createUserBankAccountIBAN = () => Joi.bankAccountIBAN().requiredKeys(
    'OwnerName', 'OwnerAddress', 'IBAN',
    'OwnerAddress.AddressLine1', 'OwnerAddress.City', 'OwnerAddress.Country'
);

Joi.createUserBankAccountGB = () => Joi.bankAccountGB().requiredKeys(
    'OwnerName', 'OwnerAddress', 'AccountNumber', 'SortCode',
    'OwnerAddress.AddressLine1', 'OwnerAddress.City', 'OwnerAddress.Country'
);

Joi.createUserBankAccountUS = () => Joi.bankAccountUS().requiredKeys(
    'OwnerName', 'AccountNumber', 'ABA', 'OwnerAddress',
    'OwnerAddress.AddressLine1', 'OwnerAddress.City', 'OwnerAddress.Country'
);

Joi.createUserBankAccountCA = () => Joi.bankAccountCA().requiredKeys(
    'OwnerName', 'AccountNumber', 'InstitutionNumber', 'BranchCode', 'BankName',
    'OwnerAddress.AddressLine1', 'OwnerAddress.City', 'OwnerAddress.Country'
);

Joi.createUserBankAccountOther = () => Joi.bankAccountOther().requiredKeys(
    'OwnerName', 'OwnerAddress', 'AccountNumber', 'BIC', 'Country',
    'OwnerAddress.AddressLine1', 'OwnerAddress.City', 'OwnerAddress.Country'
);

Joi.wallet = () => Joi.object().keys({
    Owners: Joi.array().items(Joi.string()).length(1),
    Description: Joi.string().max(255),
    Currency: Joi.currencyCode(),
    Tag: Joi.string().max(255)
});

Joi.createWallet = () => Joi.wallet().requiredKeys(
    'Owners', 'Description', 'Currency'
);

module.exports['v2.01'] = {
    userType: Joi.userType(),
    createNaturalUser: Joi.createNaturalUser(),
    updateNaturalUser: Joi.naturalUser(),
    bankAccountType: Joi.bankAccountType(),
    createUserBankAccount: {
        IBAN: Joi.createUserBankAccountIBAN(),
        GB: Joi.createUserBankAccountGB(),
        US: Joi.createUserBankAccountUS(),
        CA: Joi.createUserBankAccountCA(),
        OTHER: Joi.createUserBankAccountOther()
    },
    createWallet: Joi.createWallet(),
    updateWallet: Joi.wallet()
};