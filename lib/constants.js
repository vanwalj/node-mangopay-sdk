'use strict';

module.exports.API_VERSION = {
    'V2.01': 'v2.01'
};

module.exports.INCOME_RANGE = {
    LOWER_THAN_18K: 1,
    BETWEEN_18K_AND_30K: 2,
    BETWEEN_30K_AND_50K: 3,
    BETWEEN_50K_AND_80K: 4,
    BETWEEN_80K_AND_120K: 5,
    GREATER_THAN_120K: 6
};

module.exports.USER_TYPE = {
    NATURAL: 'natural',
    LEGAL: 'legal'
};

module.exports.BANK_ACCOUNT_TYPE = {
    IBAN: 'IBAN',
    GB: 'GB',
    US: 'US',
    CA: 'CA',
    OTHER: 'OTHER'
};

module.exports.DEPOSIT_ACCOUNT_TYPE = {
    CHECKING: 'CHECKING',
    SAVINGS: 'SAVINGS'
};

module.exports.CARD_TYPE = {
    CB_VISA_MASTERCARD: 'CB_VISA_MASTERCARD',
    MAESTRO: 'MAESTRO',
    DINERS: 'DINERS'
};