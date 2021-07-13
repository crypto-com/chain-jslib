/* eslint-disable */
import { expect } from 'chai';
import Big from 'big.js';
import { fuzzyDescribe } from '../../../../test/mocha-fuzzy/suite';
import { CroSDK, CroNetwork } from '../../../../core/cro';
import { Secp256k1KeyPair } from '../../../../keypair/secp256k1';
import { Bytes } from '../../../../utils/bytes/bytes';
import * as legacyAmino from '../../../../cosmos/amino';
import { Units } from '../../../../coin/coin';

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
let amount = new cro.Coin('1000', Units.BASE)

describe('Testing MsgFundCommunityPool', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            depositor: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            amount: [amount],
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.v2.distribution.MsgFundCommunityPoolV2(options.value)).to.throw(
                'Expected `communityPoolOptions` to be of type `object`',
            );
        });
    });

    it('Test appending MsgFundCommunityPool and signing it', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgFundCommunityPool = new cro.v2.distribution.MsgFundCommunityPoolV2({
            depositor: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            amount: [amount],
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(10),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgFundCommunityPool).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a760a740a312f636f736d6f732e646973747269627574696f6e2e763162657461312e4d736746756e64436f6d6d756e697479506f6f6c123f0a100a08626173657463726f120431303030122b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b633312580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a020801180a120410c09a0c1a400c93f8e74991dde45638e3d4366f7607fd9711272d0602f1e2e797d9180d25c30031955522e7ddc380d7ac4435e7f6d01fbea5db685655ba0b04d43b4135bf3d',
        );
    });

    describe('Testing MsgFundCommunityPool json', function () {
        it('Test MsgFundCommunityPool conversion for amino json', function () {
            const MsgWithdrawDelegatatorReward = new cro.v2.distribution.MsgFundCommunityPoolV2({
                depositor: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                amount: [amount],
            });

            const rawMsg: legacyAmino.Msg = {
                type: 'cosmos-sdk/MsgFundCommunityPool',
                value: {
                    depositor: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                    amount: amount.toCosmosCoins(),
                },
            };

            expect(MsgWithdrawDelegatatorReward.toRawAminoMsg()).to.eqls(rawMsg);
        });
    });

    describe('Testing throw scenarios', function () {
        it('Should throw on invalid depositor', function () {
            expect(() => {
                new cro.v2.distribution.MsgFundCommunityPoolV2({
                    depositor: 'cro1xh3dqgljnydpwelzqf265edryrqrq7wzacx2nr',
                    amount: [amount],
                });
            }).to.throw('Provided `depositor` address doesnt match network selected');
        });
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgFundCommunityPool', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.v2.distribution.MsgFundCommunityPoolV2.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.distribution.v1beta1.MsgFundCommunityPool but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should throw Error when the `depositor` field is missing', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgFundCommunityPool","amount":[{ "denom": "basetcro", "amount": "3478499933290496" }]}';
            expect(() => cro.v2.distribution.MsgFundCommunityPoolV2.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `depositor` to be of type `string` but received type `undefined` in object `communityPoolOptions`',
            );
        });
        it('should throw Error when the amount field is missing', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgFundCommunityPool","depositor":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.v2.distribution.MsgFundCommunityPoolV2.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid amount in the Msg.',
            );
        });
        it('should return the `MsgFundCommunityPool` corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgFundCommunityPool","amount":[{ "denom": "basetcro", "amount": "3478499933290496" }],"depositor":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';

            const msgFundCommPool = cro.v2.distribution.MsgFundCommunityPoolV2.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(msgFundCommPool.depositor).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
            expect(msgFundCommPool.amount[0].toCosmosCoin().amount).to.eql('3478499933290496');
            expect(msgFundCommPool.amount[0].toCosmosCoin().denom).to.eql('basetcro');
        });
    });
});
