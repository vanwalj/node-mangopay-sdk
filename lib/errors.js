/**
 * Created by Jordan on 12/10/15.
 */
'use strict';

class MangopayError extends Error {
    constructor (message, mangopayErrorType, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.mangopayErrorCode = mangopayErrorCode;
        this.mangopayErrorType = mangopayErrorType;
        this.mangopayDescription = mangopayDescription;
        this.mangopayMessage = mangopayMessage;
        this.errorDocumentationUrl = 'https://docs.mangopay.com/api-references/error-codes/';
        Error.captureStackTrace(this, this.constructor.name)
    }
}

class OperationFailed extends MangopayError {
    constructor (message, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message, 'Operation failed', mangopayErrorCode, mangopayMessage, mangopayDescription);
    }
}

class RefundTransactionError extends MangopayError {
    constructor (message, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message, 'Refund transaction error', mangopayErrorCode, mangopayMessage, mangopayDescription);
    }
}

class CardInputError extends MangopayError {
    constructor (message, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message, 'Card input error', mangopayErrorCode, mangopayMessage, mangopayDescription);
    }
}

class TokenInputError extends MangopayError {
    constructor (message, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message, 'Token input error', mangopayErrorCode, mangopayMessage, mangopayDescription);
    }
}

class TransactionError extends MangopayError {
    constructor (message, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message, 'Transaction error', mangopayErrorCode, mangopayMessage, mangopayDescription);
    }
}

class PayoutError extends MangopayError {
    constructor (message, mangopayErrorCode, mangopayMessage, mangopayDescription) {
        super(message, 'Payout error', mangopayErrorCode, mangopayMessage, mangopayDescription);
    }
}

class BankDoNotHonorError extends TransactionError {
    constructor (message) {
        super(
            message, '101101',
            'Transaction refused by the bank (Do not honor)',
            'The error « Do not honor » is a message from the bank. You could get it for several reasons: maximum amount spent per month has been reached on this card, maximum amount spent on internet per month has been reached on this card, no more funds on bank account'
        );
    }
}

class BankAmountLimitError extends TransactionError {
    constructor (message) {
        super(
            message, '101102',
            'Transaction refused by the bank (Amount limit)'
        );
    }
}

class TransactionRefusedByTheTerminalError extends TransactionError {
    constructor (message) {
        super(
            message, '101103',
            'Transaction refused by the terminal'
        );
    }
}

class TransactionRefusedByTheBankError extends TransactionError {
    constructor (message) {
        super(
            message, '101104',
            'Transaction refused by the bank (card limit reached)',
            'The card spent amount limit has been reached'
        );
    }
}

class CardExpiredError extends TransactionError {
    constructor (message) {
        super(
            message, '101105',
            'The card has expired'
        );
    }
}
class CardInactiveError extends TransactionError {
    constructor (message) {
        super(
            message, '101106',
            'The card is inactive',
            'The card has not been well registrated in Mangopay or the first operation (pre-authorisation or Payin) has failed. So not it is unusable'
        );
    }
}

class CardIsNotActiveError extends TransactionError {
    constructor (message) {
        super(
            message, '101410',
            'The card is not active',
            'The card has not been disabled on Mangopay and is no longer useable'
        );
    }
}

class MaximumNumberOfAttemptsReachedError extends TransactionError {
    constructor (message) {
        super(
            message, '101111',
            'Maximum number of attempts reached',
            'Too much attempts for the same transaction'
        );
    }
}

class MaximumAmountExceededError extends TransactionError {
    constructor (message) {
        super(
            message, '101112',
            'Maximum amount exceeded',
            'This is a card limitation on spent amount'
        );
    }
}

class MaximumUsesExceededError extends TransactionError {
    constructor (message) {
        super(
            message, '101113',
            'Maximum Uses Exceeded',
            'Maximum attempts with this cards reached. You must try again after 24 hours.'
        );
    }
}

class DebitLimitExceededError extends TransactionError {
    constructor (message) {
        super(
            message, '101115',
            'Debit limit exceeded',
            'This is a card limitation on spent amount'
        );
    }
}

class AmountLimitError extends TransactionError {
    constructor (message) {
        super(
            message, '101116',
            'Amount limit',
            'The contribution transaction has failed'
        );
    }
}

class DebitLimitExceededError2 extends TransactionError {
    constructor (message) {
        super(
            message, '101119',
            'Debit limit exceeded',
            'This is a card limitation on spent amount'
        );
    }
}

class TransactionRefusedError extends TransactionError {
    constructor (message) {
        super(
            message, '101199',
            'The transaction has been refused by the bank. Contact your bank in order to have more information about it.'
        );
    }
}

class GenericTokenInputError extends TokenInputError {
    constructor (message) {
        super(
            message, '105299',
            'Generic token input Error',
            'This is a generic error meaning that we got an error when submitting the token to the bank. It is usually returned because there was a too long time between the card registration request and the first action done with this card. Indeed, you have 20min maximum to create the first Pre-auth or Payin'
        );
    }
}

class CardNumberError extends TokenInputError {
    constructor (message) {
        super(
            message, '105202',
            'Card number: invalid format',
            'This error is returned in case the card number formate is wrong (on card registration)'
        );
    }
}

class ExpiryDateError extends TokenInputError {
    constructor (message) {
        super(
            message, '105203',
            'Expiry date: missing or invalid format',
            'This error is returned in case the expiry date is wrong (on card registration)'
        );
    }
}

class CVVError extends TokenInputError {
    constructor (message) {
        super(
            message, '105204',
            'CVV: missing or invalid format',
            'This error is returned in case the CVV is wrong (on card registration)'
        );
    }
}

class CallbackURLError extends TokenInputError {
    constructor (message) {
        super(
            message, '105205',
            'Callback URL: Invalid format',
            'This error is returned in case the ReturnURL is wrong on CardRegistration process.'
        );
    }
}

class RegistrationDataError extends TokenInputError {
    constructor (message) {
        super(
            message, '105206',
            'Registration data : Invalid format',
            'This error is returned in case the data sent to the tokenization server is not the right. You can get this error when you are trying to edit the CardRegistration Object with the RegistrationData(got from the tokenization server)'
        );
    }
}

class InvalidCardNumberError extends CardInputError {
    constructor (message) {
        super(
            message, '105101',
            'Invalid card number'
        );
    }
}

class InvalidCardholderNameError extends CardInputError {
    constructor (message) {
        super(
            message, '105102',
            'Invalid cardholder name',
            'The card holder name given doesn’t match the real owner of the card'
        );
    }
}

class InvalidPINCodeError extends CardInputError {
    constructor (message) {
        super(
            message, '105103',
            'Invalid PIN code'
        );
    }
}

class InvalidPINFormatError extends CardInputError {
    constructor (message) {
        super(
            message, '105104',
            'Invalid PIN format'
        );
    }
}

class TransactionHasAlreadyBeenSuccessfullyRefundedError extends RefundTransactionError {
    constructor (message) {
        super(
            message, '001401',
            'Transaction has already been successfully refunded'
        );
    }
}

class RefundCannotExceedInitialTransactionAmountError extends RefundTransactionError {
    constructor (message) {
        super(
            message, '005403',
            'The refund cannot exceed initial transaction amount'
        );
    }
}

class RefundedFeesCannotExceedInitialFeeAmountError extends RefundTransactionError {
    constructor (message) {
        super(
            message, '005404',
            'The refunded fees cannot exceed initial fee amount'
        );
    }
}

class BalanceOfClientFeeWalletInsufficientError extends RefundTransactionError {
    constructor (message) {
        super(
            message, '005405',
            'Balance of client fee wallet insufficient'
        );
    }
}

class DuplicatedOperationError extends RefundTransactionError {
    constructor (message) {
        super(
            message, '005407',
            'Duplicated operation',
            'You cannot refund the same amount more than once for a transaction during the same day'
        );
    }
}

class GenericOperationError extends OperationFailed {
    constructor (message) {
        super(
            message, '001999',
            'Generic Operation error',
            'Mangopay has no information for the bank yet'
        );
    }
}

class InsufficientWalletBalanceError extends OperationFailed {
    constructor(message) {
        super(
            message, '001001',
            'Insufficient wallet balance',
            'The wallet balance doesn\'t allow to process transaction'
        );
    }
}

class AuthorIsNotWalletOwnerError extends OperationFailed {
    constructor (message) {
        super(
            message, '001002',
            'Author is not the wallet owner',
            'The user ID used as Author as to be the wallet owner'
        );
    }
}

class TransactionAmountIsHigherThanMaximumPermittedAmountError extends OperationFailed {
    constructor (message) {
        super(
            message, '001011',
            'Transaction amount is higher than maximum permitted amount'
        );
    }
}

class TransactionAmountIsLowerThanMinimumPermittedAmountError extends OperationFailed {
    constructor (message) {
        super(
            message, '001012',
            'Transaction amount is lower than minimum permitted amount'
        );
    }
}

class InvalidTransactionAmountError extends OperationFailed {
    constructor (message) {
        super(
            message, '001013',
            'Invalid transaction amount'
        );
    }
}

class CreditedFundsMustBeMoreThanZeroError extends OperationFailed {
    constructor (message) {
        super(
            message, '001014',
            'CreditedFunds must be more than 0 (DebitedFunds can not equal Fees)'
        );
    }
}

class UserHasNotBeenRedirectedError extends OperationFailed {
    constructor (message) {
        super(
            message, '001030',
            'User has not been redirected',
            'The user never gets the payment page and never opens the Payline session'
        );
    }
}

class UserCanceledThePaymentError extends OperationFailed {
    constructor (message) {
        super(
            message, '001031',
            'User canceled the payment',
            'The User clicks on « Canceled » on the payment page'
        );
    }
}

class TransactionCancelledByTheUserError extends OperationFailed {
    constructor (message) {
        super(
            message, '101002',
            'User canceled the payment',
            'The User clicks on « Canceled » on the payment page'
        );
    }
}

class UserIsFillingInThePaymentCardDetailsError extends OperationFailed {
    constructor (message) {
        super(
            message, '001032',
            'User is filling in the payment card details',
            'The user is still on the payment page (Payline session)'
        );
    }
}

class UserHasNotBeenRedirectedThenThePaymentSessionHasExpiredError extends OperationFailed {
    constructor (message) {
        super(
            message, '001033',
            'User has not been redirected then the payment session has expired',
            'The session has expired so the Payin Web is failed. The user has gone on the payment page'
        );
    }
}

class UserHasLetThePaymentSessionExpireWithoutPayingError extends OperationFailed {
    constructor (message) {
        super(
            message, '001034',
            'User has let the payment session expire without paying',
            'The user went to the payment page ut let the session expired. So the Payin Web has failed.'
        );
    }
}

class UserDoesNotCompleteTransactionError extends OperationFailed {
    constructor (message) {
        super(
            message, '101001',
            'The user does not complete transaction'
        );
    }
}

module.exports.errors = {
    InsufficientWalletBalanceError,
    AuthorIsNotWalletOwnerError,
    TransactionAmountIsHigherThanMaximumPermittedAmountError,
    TransactionAmountIsLowerThanMinimumPermittedAmountError,
    InvalidTransactionAmountError,
    CreditedFundsMustBeMoreThanZeroError,
    UserHasNotBeenRedirectedError,
    UserCanceledThePaymentError,
    UserIsFillingInThePaymentCardDetailsError,
    UserHasNotBeenRedirectedThenThePaymentSessionHasExpiredError,
    UserHasLetThePaymentSessionExpireWithoutPayingError,
    TransactionHasAlreadyBeenSuccessfullyRefundedError,
    GenericOperationError,
    RefundCannotExceedInitialTransactionAmountError,
    RefundedFeesCannotExceedInitialFeeAmountError,
    BalanceOfClientFeeWalletInsufficientError,
    DuplicatedOperationError,
    UserDoesNotCompleteTransactionError,
    TransactionCancelledByTheUserError,
    BankDoNotHonorError,
    InvalidCardNumberError,
    InvalidCardholderNameError,
    InvalidPINCodeError,
    InvalidPINFormatError,
    CardNumberError,
    ExpiryDateError,
    CVVError,
    CallbackURLError,
    RegistrationDataError,
    GenericTokenInputError,
    TransactionRefusedError,
    DebitLimitExceededError2,
    AmountLimitError,
    DebitLimitExceededError,
    MaximumUsesExceededError,
    MaximumAmountExceededError,
    MaximumNumberOfAttemptsReachedError,
    CardIsNotActiveError,
    CardInactiveError,
    CardExpiredError,
    TransactionRefusedByTheBankError,
    TransactionRefusedByTheTerminalError,
    BankAmountLimitError
};

module.exports.codes = {
    '001001': InsufficientWalletBalanceError,
    '001002': AuthorIsNotWalletOwnerError,
    '001011': TransactionAmountIsHigherThanMaximumPermittedAmountError,
    '001012': TransactionAmountIsLowerThanMinimumPermittedAmountError,
    '001013': InvalidTransactionAmountError,
    '001014': CreditedFundsMustBeMoreThanZeroError,
    '001030': UserHasNotBeenRedirectedError,
    '001031': UserCanceledThePaymentError,
    '001032': UserIsFillingInThePaymentCardDetailsError,
    '001033': UserHasNotBeenRedirectedThenThePaymentSessionHasExpiredError,
    '001034': UserHasLetThePaymentSessionExpireWithoutPayingError,
    '001401': TransactionHasAlreadyBeenSuccessfullyRefundedError,
    '001999': GenericOperationError,
    '005403': RefundCannotExceedInitialTransactionAmountError,
    '005404': RefundedFeesCannotExceedInitialFeeAmountError,
    '005405': BalanceOfClientFeeWalletInsufficientError,
    '005407': DuplicatedOperationError,
    '101001': UserDoesNotCompleteTransactionError,
    '101002': TransactionCancelledByTheUserError,
    '101101': BankDoNotHonorError,
    '105101': InvalidCardNumberError,
    '105102': InvalidCardholderNameError,
    '105103': InvalidPINCodeError,
    '105104': InvalidPINFormatError,
    '105202': CardNumberError,
    '105203': ExpiryDateError,
    '105204': CVVError,
    '105205': CallbackURLError,
    '105206': RegistrationDataError,
    '105299': GenericTokenInputError,
    '101199': TransactionRefusedError,
    '101119': DebitLimitExceededError2,
    '101116': AmountLimitError,
    '101115': DebitLimitExceededError,
    '101113': MaximumUsesExceededError,
    '101112': MaximumAmountExceededError,
    '101111': MaximumNumberOfAttemptsReachedError,
    '101410': CardIsNotActiveError,
    '101106': CardInactiveError,
    '101105': CardExpiredError,
    '101104': TransactionRefusedByTheBankError,
    '101103': TransactionRefusedByTheTerminalError,
    '101102': BankAmountLimitError
};