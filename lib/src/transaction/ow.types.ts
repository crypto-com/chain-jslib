import ow from 'ow';
import Big from 'big.js';

import { owNetwork } from '../network/ow.types';
import { owBig, owStrictObject } from '../ow.types';
import { owBytes } from '../utils/bytes/ow.types';
import { isBigInteger } from '../utils/big';
import { SIGN_MODE } from './types';

export const owRawTransactionOptions = owStrictObject().exactShape({
    network: owNetwork(),
});

const validateSignMode = (value: number) => ({
    validator: Object.values(SIGN_MODE).includes(value as any),
    message: (label: string) => `Expected ${label} to be one of the sign mode, got \`${value}\``,
});

export const owSignMode = () => ow.number.validate(validateSignMode);
export const owOptionalSignMode = () => ow.optional.number.validate(validateSignMode);

export const owRawTransactionSigner = owStrictObject().exactShape({
    publicKey: owBytes(),
    accountNumber: owBig(),
    accountSequence: owBig(),
    signMode: owOptionalSignMode(),
});

export const owTimeoutHeight = ow.string.validate((value) => {
    try {
        const big = new Big(value);
        return {
            validator: isBigInteger(big) && big.gte(0),
            message: `Expected timeout height to be 0 or an positive integer string, got \`${value}\``,
        };
    } catch {
        return {
            validator: false,
            message: `Expected timeout height to be integer string, got \`${value}\``,
        };
    }
});

export const owSignerAccount = () =>
    owStrictObject().exactShape({
        publicKey: owBytes(),
        accountNumber: owBig(),
        signMode: owSignMode(),
    });

export const owSignableTransactionParams = owStrictObject().exactShape({
    rawTxJSON: ow.string,
    network: owNetwork(),
    signerAccounts: ow.optional.array.ofType(owSignerAccount()),
});
