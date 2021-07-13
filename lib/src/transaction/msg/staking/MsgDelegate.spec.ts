import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';

import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Bytes } from '../../../utils/bytes/bytes';
import { Units } from '../../../coin/coin';
import { CroSDK, CroNetwork } from '../../../core/cro';
import * as legacyAmino from '../../../cosmos/amino';

const cro = CroSDK({
    network: {
        defaultNodeUrl: '',
        chainId: 'testnet-croeseid-1',
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
        rpcUrl: '',
    },
});

describe('Testing MsgDelegate', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: new cro.Coin('1000', Units.BASE),
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.staking.MsgDelegate(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgDelegate conversion', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const MsgDelegate = new cro.staking.MsgDelegate({
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: coin,
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
            value: {
                delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                amount: {
                    denom: 'basetcro',
                    amount: '12000500',
                },
            },
        };

        expect(MsgDelegate.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgDelegate Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );
        const coin = new cro.Coin('12000500', Units.CRO);

        const MsgDelegate = new cro.staking.MsgDelegate({
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: coin,
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgDelegate).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0aa6010aa3010a232f636f736d6f732e7374616b696e672e763162657461312e4d736744656c6567617465127c0a2b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b6333122f7463726f636e636c316a3770656a386b706c656d347774353070346866766e64687577356a707278787874656e76721a1c0a08626173657463726f12103132303030353030303030303030303012580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a4020f8051ca7bf5c8ce6fa3887cb22a2bbde1db7e6d860fc35739a4a38df2077f32c7bc6ab33178555481c4a8466cc8e642354019f5793533a952c58629234aaed',
        );
    });

    it('Should validate MsgDelegate provided addresses with network config', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const params1 = {
            delegatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: coin,
        };

        const params2 = {
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            amount: coin,
        };

        const params3 = {
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: coin,
        };

        expect(() => new cro.staking.MsgDelegate(params1)).to.throw(
            'Provided `delegatorAddress` doesnt match network selected',
        );
        expect(() => new cro.staking.MsgDelegate(params2)).to.throw(
            'Provided `validatorAddress` doesnt match network selected',
        );
        expect(() => new cro.staking.MsgDelegate(params3)).to.throw(
            'Invalid checksum for tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc',
        );
    });

    describe('Testing MsgDelegate Json', function () {
        it('Test MsgDelegate conversion for amino json', function () {
            const coin = new cro.Coin('12000500', Units.BASE);

            const MsgDelegate = new cro.staking.MsgDelegate({
                delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                amount: coin,
            });

            const rawMsg: legacyAmino.Msg = {
                type: 'cosmos-sdk/MsgDelegate',
                value: {
                    delegator_address: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                    validator_address: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                    amount: {
                        denom: 'basetcro',
                        amount: '12000500',
                    },
                },
            };

            expect(MsgDelegate.toRawAminoMsg()).to.eqls(rawMsg);
        });
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgDelegate', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.staking.MsgDelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.staking.v1beta1.MsgDelegate but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `validator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgDelegate","delegator_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            expect(() => cro.staking.MsgDelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `validatorAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });

        it('should throw Error when the `delegator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgDelegate","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            expect(() => cro.staking.MsgDelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `delegatorAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the amount field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgDelegate","delegator_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr"}';
            expect(() => cro.staking.MsgDelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid amount in the Msg.',
            );
        });
        it('should return the MsgDelegate corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgDelegate","delegator_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            const MsgDelegate = cro.staking.MsgDelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgDelegate.validatorAddress).to.eql('tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr');
            expect(MsgDelegate.delegatorAddress).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
            expect(MsgDelegate.amount.toCosmosCoin().amount).to.eql('1200050000000000');
            expect(MsgDelegate.amount.toCosmosCoin().denom).to.eql('basetcro');
        });
    });
});
