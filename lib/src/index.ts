import Big from 'big.js';
import { HDKey } from './hdkey/hdkey';
import { Secp256k1KeyPair } from './keypair/secp256k1';
import utils from './utils';
import { CroNetwork, CroSDK } from './core/cro';
import { Units } from './coin/coin';
import { TxDecoder } from './utils/txDecoder';

// The maximum number of decimal places of the results of operations involving division
// By default it is 20. Here we explicitly set it to 20 for correctness.
Big.DP = 20;

const _ = {
    utils,
    HDKey,
    Secp256k1KeyPair,
    CroSDK,
    CroNetwork,
    Units,
    TxDecoder,
};

export = _;
