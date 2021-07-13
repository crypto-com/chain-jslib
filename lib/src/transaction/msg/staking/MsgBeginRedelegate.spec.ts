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

describe('Testing MsgBeginRedelegate', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorSrcAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: new cro.Coin('1000', Units.BASE),
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.staking.MsgBeginRedelegate(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgBeginRedelegate conversion', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const msgBeginRedelegate = new cro.staking.MsgBeginRedelegate({
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorSrcAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            amount: coin,
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
            value: {
                delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
                validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                validatorSrcAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
                amount: coin.toCosmosCoin(),
            },
        };

        expect(msgBeginRedelegate.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test MsgBeginRedelegate conversion Json', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const msgBeginRedelegate = new cro.staking.MsgBeginRedelegate({
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorSrcAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            amount: coin,
        });

        const rawMsg: legacyAmino.Msg = {
            type: 'cosmos-sdk/MsgBeginRedelegate',
            value: {
                delegator_address: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
                validator_src_address: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
                validator_dst_address: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                amount: {
                    denom: 'basetcro',
                    amount: '12000500',
                },
            },
        };

        expect(msgBeginRedelegate.toRawAminoMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgBeginRedelegate Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );
        const coin = new cro.Coin('12000500', Units.CRO);

        const MsgBeginRedelegate = new cro.staking.MsgBeginRedelegate({
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorSrcAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            amount: coin,
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgBeginRedelegate).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0adf010adc010a2a2f636f736d6f732e7374616b696e672e763162657461312e4d7367426567696e526564656c656761746512ad010a2b7463726f316a3770656a386b706c656d347774353070346866766e64687577356a707278786e3536323571122f7463726f636e636c31366d6d7a657870337a7166706771746e6e3932376d35706835363071677872733532613377781a2f7463726f636e636c316a3770656a386b706c656d347774353070346866766e64687577356a707278787874656e7672221c0a08626173657463726f12103132303030353030303030303030303012580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a4059a63d435b7f3a6c7a4b5b6da22fb6ccad147737c196ffce1491cc1ddca259a15a61f60a9f425911fff765d69c753a66bf7c77b363877eebbe5e07318f6b1136',
        );
    });

    it('Should validate MsgBeginRedelegate provided addresses with network config', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const params2 = {
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorSrcAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            amount: coin,
        };

        const params3 = {
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625',
            validatorDstAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            validatorSrcAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            amount: coin,
        };

        expect(() => new cro.staking.MsgBeginRedelegate(params2)).to.throw(
            'Source and destination validator addresses cannot be the same.',
        );
        expect(() => new cro.staking.MsgBeginRedelegate(params3)).to.throw(
            'Invalid checksum for tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgBeginRedelegate', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.staking.MsgBeginRedelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.staking.v1beta1.MsgBeginRedelegate but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `validator_src_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgBeginRedelegate","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_dst_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            expect(() => cro.staking.MsgBeginRedelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `validatorSrcAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `validator_dst_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgBeginRedelegate","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_src_address":"tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            expect(() => cro.staking.MsgBeginRedelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `validatorDstAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });

        it('should throw Error when the `delegator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgBeginRedelegate","validator_src_address":"tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx","validator_dst_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            expect(() => cro.staking.MsgBeginRedelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `delegatorAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the amount field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgBeginRedelegate","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_src_address":"tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx","validator_dst_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr"}';
            expect(() => cro.staking.MsgBeginRedelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid amount in the Msg.',
            );
        });
        it('should return the MsgBeginRedelegate corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgBeginRedelegate","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_src_address":"tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx","validator_dst_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","amount":{"denom":"basetcro","amount":"1200050000000000"}}';
            const MsgBeginRedelegate = cro.staking.MsgBeginRedelegate.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgBeginRedelegate.validatorDstAddress).to.eql('tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr');
            expect(MsgBeginRedelegate.validatorSrcAddress).to.eql('tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx');
            expect(MsgBeginRedelegate.delegatorAddress).to.eql('tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q');
            expect(MsgBeginRedelegate.amount.toCosmosCoin().amount).to.eql('1200050000000000');
            expect(MsgBeginRedelegate.amount.toCosmosCoin().denom).to.eql('basetcro');
        });
    });
});
