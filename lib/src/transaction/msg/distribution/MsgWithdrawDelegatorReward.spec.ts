import { expect } from 'chai';
import Big from 'big.js';
import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { CroSDK, CroNetwork } from '../../../core/cro';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Bytes } from '../../../utils/bytes/bytes';
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

describe('Testing MsgWithdrawDelegatorReward', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3xcqa',
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.distribution.MsgWithdrawDelegatorReward(options.value)).to.throw(
                'Expected `rewardOptions` to be of type `object`',
            );
        });
    });

    it('Test appending MsgWithdrawDelegatorReward and signing it', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const msgWithdrawDelegatorReward = new cro.distribution.MsgWithdrawDelegatorReward({
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(10),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(msgWithdrawDelegatorReward).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a9c010a99010a372f636f736d6f732e646973747269627574696f6e2e763162657461312e4d7367576974686472617744656c656761746f72526577617264125e0a2b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b6333122f7463726f636e636c317265797368666479676637363733786d39703876307876746439366d3663643663616e68753312580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a020801180a120410c09a0c1a401772502bcd1710f73a45bafd9e96d868b856593ff326ed31c17aff82dbd3849601e69505b79949583067781a9170e44e3c33ccec6de09dbf313fbee843e60f91',
        );
    });

    describe('Testing MsgWithdrawDelegatorReward json', function () {
        it('Test MsgWithdrawDelegatorReward conversion for amino json', function () {
            const MsgWithdrawDelegatatorReward = new cro.distribution.MsgWithdrawDelegatorReward({
                delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                validatorAddress: 'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3',
            });

            const rawMsg: legacyAmino.Msg = {
                type: 'cosmos-sdk/MsgWithdrawDelegationReward',
                value: {
                    delegator_address: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                    validator_address: 'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3',
                },
            };

            expect(MsgWithdrawDelegatatorReward.toRawAminoMsg()).to.eqls(rawMsg);
        });
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgWithdrawDelegatorReward', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() =>
                cro.distribution.MsgWithdrawDelegatorReward.fromCosmosMsgJSON(json, CroNetwork.Testnet),
            ).to.throw(
                'Expected /cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should throw Error when the `validator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward","delegator_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() =>
                cro.distribution.MsgWithdrawDelegatorReward.fromCosmosMsgJSON(json, CroNetwork.Testnet),
            ).to.throw(
                'Expected property `validatorAddress` to be of type `string` but received type `undefined` in object `rewardOptions`',
            );
        });
        it('should throw Error when the `delegator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward","validator_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() =>
                cro.distribution.MsgWithdrawDelegatorReward.fromCosmosMsgJSON(json, CroNetwork.Testnet),
            ).to.throw(
                'Expected property `delegatorAddress` to be of type `string` but received type `undefined` in object `rewardOptions`',
            );
        });
        it('should return the `MsgWithdrawDelegatorReward` corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward","delegator_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","validator_address":"tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3"}';

            const MsgWithdrawDelegatorReward = cro.distribution.MsgWithdrawDelegatorReward.fromCosmosMsgJSON(
                json,
                CroNetwork.Testnet,
            );
            expect(MsgWithdrawDelegatorReward.validatorAddress).to.eql(
                'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3',
            );
            expect(MsgWithdrawDelegatorReward.delegatorAddress).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
        });
    });
});
