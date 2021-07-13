/* eslint-disable */
import 'mocha';
import Big from 'big.js';
import { expect } from 'chai';
import { assertIsBroadcastTxSuccess } from '@cosmjs/stargate';
import axios from 'axios';

import { HDKey } from '../src/hdkey/hdkey';
import { Secp256k1KeyPair } from '../src/keypair/secp256k1';
import { CroSDK } from '../src/core/cro';
import { Units } from '../src/coin/coin';
import { Network } from '../src/network/network';
import { SIGN_MODE } from '../src/transaction/types';

const customNetwork: Network = {
    defaultNodeUrl: '',
    chainId: 'testnet',
    addressPrefix: 'tcro',
    validatorAddressPrefix: 'tcrocncl',
    validatorPubKeyPrefix: 'tcrocnclconspub',
    coin: {
        baseDenom: 'basetcro',
        croDenom: 'tcro',
    },
    bip44Path: {
        coinType: 1,
        account: 0,
    },
    rpcUrl: 'http://localhost:26657',
};

const testNode = {
    httpEndpoint: 'localhost',
    httpPort: '26657',
};

const axiosConfig = {
    method: 'get',
    url: `http://${testNode.httpEndpoint}:${testNode.httpPort}`,
};
const env = {
    validatorOperatorAddress: process.env.VALIDATOR_OPERATOR_ADDRESS || '',
    mnemonic: {
        communityAccount:
            process.env.COMMUNITY_ACCOUNT_MNEMONIC ||
            'play release domain walnut sword reason few fish sketch radio fancy since zebra exhibit boring army green suggest behind correct neither useful cruel type',
        reserveAccount:
            process.env.RESERVE_ACCOUNT_MNEMONIC ||
            'improve speak symbol relax eyebrow vintage load grief huge wild doctor novel use borrow inch sweet symptom script nuclear drastic green corn phrase razor',
        ecosystemAccount:
            process.env.ECOSYSTEM_ACCOUNT_MNEMONIC ||
            'rubber rocket snack author mad ship core physical arrange language enrich story lamp move dynamic into game marine ramp trap anchor beyond mystery gun',
        validatorAccount:
            process.env.VALIDATOR_ACCOUNT_MNEMONIC ||
            'whale dry improve icon perfect sauce lesson wire oblige gadget exhaust toast spin enforce labor logic giraffe feed project weasel absent build reject life',
        randomEmptyAccount: HDKey.generateMnemonic(12),
    },
};

describe('e2e test suite', function () {
    describe('`v2` message types', function () {
        it('[BANK] creates a MsgSend Type Transaction and Broadcasts it.', async function () {
            const hdKey = HDKey.fromMnemonic(env.mnemonic.communityAccount);
            const hdKey2 = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
            const hdKey3 = HDKey.fromMnemonic(env.mnemonic.randomEmptyAccount);
            const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
            const privKey2 = hdKey2.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
            const randomPrivKey = hdKey3.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
            const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);
            const keyPair2 = Secp256k1KeyPair.fromPrivKey(privKey2);
            const randomKeyPair = Secp256k1KeyPair.fromPrivKey(randomPrivKey);

            const cro = CroSDK({ network: customNetwork });
            const rawTx = new cro.RawTransaction();
            const address1 = new cro.Address(keyPair.getPubKey());
            const address2 = new cro.Address(keyPair2.getPubKey());
            const randomAddress = new cro.Address(randomKeyPair.getPubKey());
            const client = await cro.CroClient.connect();

            const msgSend1 = new cro.v2.bank.MsgSendV2({
                fromAddress: address1.account(),
                toAddress: randomAddress.account(),
                amount: [new cro.Coin('100000', Units.BASE)],
            });

            const msgSend2 = new cro.v2.bank.MsgSendV2({
                fromAddress: address2.account(),
                toAddress: address1.account(),
                amount: [new cro.Coin('20000', Units.BASE)],
            });

            const account1 = await client.getAccount(address1.account());
            const account2 = await client.getAccount(address2.account());

            expect(account1).to.be.not.null;
            expect(account2).to.be.not.null;

            const signableTx = rawTx
                .appendMessage(msgSend1)
                .appendMessage(msgSend2)
                .addSigner({
                    publicKey: keyPair.getPubKey(),
                    accountNumber: new Big(account1!.accountNumber),
                    accountSequence: new Big(account1!.sequence),
                })
                .addSigner({
                    publicKey: keyPair2.getPubKey(),
                    accountNumber: new Big(account2!.accountNumber),
                    accountSequence: new Big(account2!.sequence),
                })
                .toSignable();

            const signedTx = signableTx
                .setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0)))
                .setSignature(1, keyPair2.sign(signableTx.toSignDocumentHash(1)))
                .toSigned();

            expect(msgSend1.fromAddress).to.eq(account1!.address);
            expect(msgSend1.toAddress).to.eq(randomAddress.account());
            const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
            assertIsBroadcastTxSuccess(broadcastResult);

            const { transactionHash } = broadcastResult;
            expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        });
    })

    it('[BANK] creates a MsgSend type Transaction Signed by Legacy Amino JSON mode and Broadcasts it', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.communityAccount);
        const hdKey2 = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const hdKey3 = HDKey.fromMnemonic(env.mnemonic.randomEmptyAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const privKey2 = hdKey2.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const randomPrivKey = hdKey3.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);
        const keyPair2 = Secp256k1KeyPair.fromPrivKey(privKey2);
        const randomKeyPair = Secp256k1KeyPair.fromPrivKey(randomPrivKey);

        const cro = CroSDK({ network: customNetwork });
        const rawTx = new cro.RawTransaction();
        const address1 = new cro.Address(keyPair.getPubKey());
        const address2 = new cro.Address(keyPair2.getPubKey());
        const randomAddress = new cro.Address(randomKeyPair.getPubKey());
        const client = await cro.CroClient.connect();

        const msgSend1 = new cro.bank.MsgSend({
            fromAddress: address1.account(),
            toAddress: randomAddress.account(),
            amount: new cro.Coin('100000', Units.BASE),
        });

        const msgSend2 = new cro.bank.MsgSend({
            fromAddress: address2.account(),
            toAddress: address1.account(),
            amount: new cro.Coin('20000', Units.BASE),
        });

        const account1 = await client.getAccount(address1.account());
        const account2 = await client.getAccount(address2.account());

        expect(account1).to.be.not.null;
        expect(account2).to.be.not.null;

        const signableTx = rawTx
            .appendMessage(msgSend1)
            .appendMessage(msgSend2)
            .addSigner({
                publicKey: keyPair.getPubKey(),
                accountNumber: new Big(account1!.accountNumber),
                accountSequence: new Big(account1!.sequence),
                signMode: SIGN_MODE.LEGACY_AMINO_JSON,
            })
            .addSigner({
                publicKey: keyPair2.getPubKey(),
                accountNumber: new Big(account2!.accountNumber),
                accountSequence: new Big(account2!.sequence),
                signMode: SIGN_MODE.LEGACY_AMINO_JSON,
            })
            .toSignable();

        const signedTx = signableTx
            .setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0)))
            .setSignature(1, keyPair2.sign(signableTx.toSignDocumentHash(1)))
            .toSigned();

        expect(msgSend1.fromAddress).to.eq(account1!.address);
        expect(msgSend1.toAddress).to.eq(randomAddress.account());
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);

        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
    });

    it('[BANK] creates a MsgSend Type Transaction and Broadcasts it.', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.communityAccount);
        const hdKey2 = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const hdKey3 = HDKey.fromMnemonic(env.mnemonic.randomEmptyAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const privKey2 = hdKey2.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const randomPrivKey = hdKey3.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);
        const keyPair2 = Secp256k1KeyPair.fromPrivKey(privKey2);
        const randomKeyPair = Secp256k1KeyPair.fromPrivKey(randomPrivKey);

        const cro = CroSDK({ network: customNetwork });
        const rawTx = new cro.RawTransaction();
        const address1 = new cro.Address(keyPair.getPubKey());
        const address2 = new cro.Address(keyPair2.getPubKey());
        const randomAddress = new cro.Address(randomKeyPair.getPubKey());
        const client = await cro.CroClient.connect();

        const msgSend1 = new cro.bank.MsgSend({
            fromAddress: address1.account(),
            toAddress: randomAddress.account(),
            amount: new cro.Coin('100000', Units.BASE),
        });

        const msgSend2 = new cro.bank.MsgSend({
            fromAddress: address2.account(),
            toAddress: address1.account(),
            amount: new cro.Coin('20000', Units.BASE),
        });

        const account1 = await client.getAccount(address1.account());
        const account2 = await client.getAccount(address2.account());

        expect(account1).to.be.not.null;
        expect(account2).to.be.not.null;

        const signableTx = rawTx
            .appendMessage(msgSend1)
            .appendMessage(msgSend2)
            .addSigner({
                publicKey: keyPair.getPubKey(),
                accountNumber: new Big(account1!.accountNumber),
                accountSequence: new Big(account1!.sequence),
            })
            .addSigner({
                publicKey: keyPair2.getPubKey(),
                accountNumber: new Big(account2!.accountNumber),
                accountSequence: new Big(account2!.sequence),
            })
            .toSignable();

        const signedTx = signableTx
            .setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0)))
            .setSignature(1, keyPair2.sign(signableTx.toSignDocumentHash(1)))
            .toSigned();

        expect(msgSend1.fromAddress).to.eq(account1!.address);
        expect(msgSend1.toAddress).to.eq(randomAddress.account());
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);

        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
    });
    it('[BANK] creates a MsgSend Type Transaction with `Fee` amount and Broadcasts it.', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.communityAccount);
        const hdKey2 = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const hdKey3 = HDKey.fromMnemonic(env.mnemonic.randomEmptyAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const privKey2 = hdKey2.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const randomPrivKey = hdKey3.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);
        const keyPair2 = Secp256k1KeyPair.fromPrivKey(privKey2);
        const randomKeyPair = Secp256k1KeyPair.fromPrivKey(randomPrivKey);

        const cro = CroSDK({ network: customNetwork });
        const rawTx = new cro.RawTransaction();
        const address1 = new cro.Address(keyPair.getPubKey());
        const address2 = new cro.Address(keyPair2.getPubKey());
        const randomAddress = new cro.Address(randomKeyPair.getPubKey());
        const client = await cro.CroClient.connect();

        const msgSend1 = new cro.bank.MsgSend({
            fromAddress: address1.account(),
            toAddress: randomAddress.account(),
            amount: new cro.Coin('100000', Units.BASE),
        });

        const account1 = await client.getAccount(address1.account());
        const account2 = await client.getAccount(address2.account());

        expect(account1).to.be.not.null;
        expect(account2).to.be.not.null;

        const signableTx = rawTx
            .appendMessage(msgSend1)
            .addSigner({
                publicKey: keyPair.getPubKey(),
                accountNumber: new Big(account1!.accountNumber),
                accountSequence: new Big(account1!.sequence),
            })
            .setFee(cro.Coin.fromCRO("0.002"))
            .toSignable();

        const signedTx = signableTx
            .setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0)))
            .toSigned();

        expect(msgSend1.fromAddress).to.eq(account1!.address);
        expect(msgSend1.toAddress).to.eq(randomAddress.account());
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);

        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
    });

    it('[STAKING] Creates, signs and broadcasts a `MsgDelegate` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgDelegate = new cro.staking.MsgDelegate({
            amount: new cro.Coin('100000000', Units.BASE),
            validatorAddress: env.validatorOperatorAddress,
            delegatorAddress: address1.account(),
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgDelegate).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);
        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        expect(broadcastResult.data).to.be.not.undefined;
    });

    it('[STAKING] Creates, signs and broadcasts a `MsgUndelegate` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgUndelegate = new cro.staking.MsgUndelegate({
            amount: new cro.Coin('10000000', Units.BASE),
            validatorAddress: env.validatorOperatorAddress,
            delegatorAddress: address1.account(),
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgUndelegate).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);
        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        expect(broadcastResult.data).to.be.not.undefined;
    });

    it('[STAKING] Creates, signs and broadcasts a `MsgCreateValidator` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);
        const pubkey = '3GAZ/aIuvckfS9duB2+4cBxabkPAd/UegRokT6kZg68=';
        const cro = CroSDK({ network: customNetwork });
        const addressAccount = new cro.Address(keyPair.getPubKey());
        const MsgCreateValidator = new cro.staking.MsgCreateValidator({
            validatorAddress: addressAccount.validator(),
            description: {
                moniker: 'Random',
                securityContact: '[do-not-modify]',
                details: '[do-not-modify]',
                identity: '[do-not-modify]',
                website: '[do-not-modify]',
            },
            commission: {
                rate: '10',
                maxChangeRate: '1',
                maxRate: '25',
            },
            minSelfDelegation: '1',
            delegatorAddress: addressAccount.account(),
            pubkey,
            value: new cro.Coin('1000000000', Units.BASE),
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(addressAccount.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgCreateValidator).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);
        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        expect(broadcastResult.data).to.be.not.undefined;
    });

    it('[STAKING] Creates, signs and broadcasts a `MsgEditValidator` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgEditValidator = new cro.staking.MsgEditValidator({
            validatorAddress: address1.validator(),
            description: {
                moniker: `Random1${Date.now()}`,
            },
            commissionRate: null,
            minSelfDelegation: null,
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgEditValidator).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);
        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        expect(broadcastResult.data).to.be.not.undefined;
    });

    it('[STAKING] Creates, signs and broadcasts a `MsgBeginRedelegate` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgBeginRedelegate = new cro.staking.MsgBeginRedelegate({
            amount: new cro.Coin('10000000', Units.BASE),
            validatorDstAddress: env.validatorOperatorAddress,
            validatorSrcAddress: address1.validator(),
            delegatorAddress: address1.account(),
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        rawTx.setGasLimit('300000');
        const signableTx = rawTx.appendMessage(MsgBeginRedelegate).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);
        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        expect(broadcastResult.data).to.be.not.undefined;
    });
    it('[DISTRIBUTION] Creates, signs and broadasts a `MsgWithdrawDelegatorReward` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgWithdrawDelegatorReward = new cro.distribution.MsgWithdrawDelegatorReward({
            validatorAddress: env.validatorOperatorAddress,
            delegatorAddress: address1.account(),
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgWithdrawDelegatorReward).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcastResult = await client.broadcastTx(signedTx.encode().toUint8Array());
        assertIsBroadcastTxSuccess(broadcastResult);
        const { transactionHash } = broadcastResult;
        expect(transactionHash).to.match(/^[0-9A-F]{64}$/);
        expect(broadcastResult.data).to.be.not.undefined;
    });

    it('[DISTRIBUTION] Creates, signs and broadcasts a `MsgWithdrawValidatorCommission` Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.ecosystemAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgWithdrawValidatorCommission = new cro.distribution.MsgWithdrawValidatorCommission({
            validatorAddress: address1.validator(),
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgWithdrawValidatorCommission).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const broadcast = await axios.get('broadcast_tx_commit', {
            baseURL: axiosConfig.url,
            params: { tx: `0x${signedTx.getHexEncoded()}` },
        });
        expect(broadcast.status).to.eq(200);
        expect(broadcast.data).to.be.not.undefined;
        assertIsBroadcastTxSuccess(broadcast.data);
    });

    it('[NFT] Creates, signs and broadcasts a `MsgIssueDenom` NFT Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());
        const MsgIssueDenom = new cro.nft.MsgIssueDenom({
            id: 'alpha1',
            name: 'alpha1',
            schema: 'schema',
            sender: 'tcro1c5nd9l5ylh8udw5lsfs0hlvzxwrlymxqlnl266',
        });

        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgIssueDenom).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const broadcast = await axios.get('broadcast_tx_commit', {
            baseURL: axiosConfig.url,
            params: { tx: `0x${signedTx.getHexEncoded()}` },
        });
        expect(broadcast.status).to.eq(200);
        expect(broadcast.data).to.be.not.undefined;
        assertIsBroadcastTxSuccess(broadcast.data);
    });

    it('[NFT] Creates, signs and broadcasts a `MsgMintNFT` NFT Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());

        const MsgMintNFT = new cro.nft.MsgMintNFT({
            id: 'nft1',
            name: 'mannu',
            denomId: 'alpha1',
            uri: 'someUri',
            data: 'randomData',
            sender: 'tcro1c5nd9l5ylh8udw5lsfs0hlvzxwrlymxqlnl266',
            recipient: 'tcro1c5nd9l5ylh8udw5lsfs0hlvzxwrlymxqlnl266',
        });
        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgMintNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const broadcast = await axios.get('broadcast_tx_commit', {
            baseURL: axiosConfig.url,
            params: { tx: `0x${signedTx.getHexEncoded()}` },
        });
        expect(broadcast.status).to.eq(200);
        expect(broadcast.data).to.be.not.undefined;
        assertIsBroadcastTxSuccess(broadcast.data);
    });

    it('[NFT] Creates, signs and broadcasts a `MsgTransferNFT` NFT Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());

        const MsgTransferNFT = new cro.nft.MsgTransferNFT({
            id: 'nft1',
            denomId: 'alpha1',
            sender: address1.account(),
            recipient: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
        });
        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgTransferNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const broadcast = await axios.get('broadcast_tx_commit', {
            baseURL: axiosConfig.url,
            params: { tx: `0x${signedTx.getHexEncoded()}` },
        });
        expect(broadcast.status).to.eq(200);
        expect(broadcast.data).to.be.not.undefined;
        assertIsBroadcastTxSuccess(broadcast.data);
    });

    it('[NFT] Creates, signs and broadcasts a `MsgEditNFT` NFT Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());

        const MsgEditNFT = new cro.nft.MsgEditNFT({
            id: 'nft1',
            name: 'newname',
            denomId: 'alpha1',
            uri: 'newuri',
            data: 'dataupdated',
            sender: address1.account(),
        });
        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgEditNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const broadcast = await axios.get('broadcast_tx_commit', {
            baseURL: axiosConfig.url,
            params: { tx: `0x${signedTx.getHexEncoded()}` },
        });
        expect(broadcast.status).to.eq(200);
        expect(broadcast.data).to.be.not.undefined;
        assertIsBroadcastTxSuccess(broadcast.data);
    });

    it('[NFT] Creates, signs and broadcasts a `MsgBurnNFT` NFT Tx', async function () {
        const hdKey = HDKey.fromMnemonic(env.mnemonic.reserveAccount);
        const privKey = hdKey.derivePrivKey(`m/44'/${customNetwork.bip44Path.coinType}'/0'/0/0`);

        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const cro = CroSDK({ network: customNetwork });
        const address1 = new cro.Address(keyPair.getPubKey());

        const MsgBurnNFT = new cro.nft.MsgBurnNFT({
            id: 'nft1',
            denomId: 'alpha1',
            sender: address1.account(),
        });
        const client = await cro.CroClient.connect();

        expect(client).to.be.not.undefined;
        const account = await client.getAccount(address1.account());
        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(account!.accountNumber),
            accountSequence: new Big(account!.sequence),
        };
        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgBurnNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const broadcast = await axios.get('broadcast_tx_commit', {
            baseURL: axiosConfig.url,
            params: { tx: `0x${signedTx.getHexEncoded()}` },
        });
        expect(broadcast.status).to.eq(200);
        expect(broadcast.data).to.be.not.undefined;
        assertIsBroadcastTxSuccess(broadcast.data);
    });
});
