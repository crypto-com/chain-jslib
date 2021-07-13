import { expect } from 'chai';
import Big from 'big.js';
import { CroSDK, CroNetwork } from '../../../core/cro';
import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Bytes } from '../../../utils/bytes/bytes';

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

describe('Testing MsgWithdrawValidatorCommission', function () {
    fuzzyDescribe('should throw Error when constructor options is invalid', function (fuzzy) {
        const anyValidOptions = {
            validatorAddress: 'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3xcqa',
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.distribution.MsgWithdrawValidatorCommission(options.value)).to.throw(
                'Expected `commissionWithdrawalOptions` to be of type `object`',
            );
        });
    });

    it('Test appending MsgWithdrawValidatorCommission and signing it', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const msgWithdrawValidatorCommission = new cro.distribution.MsgWithdrawValidatorCommission({
            validatorAddress: 'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3',
        });

        const commissionSigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(10),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(msgWithdrawValidatorCommission).addSigner(commissionSigner).toSignable();

        const signedCommissionWithdrawTx = signableTx
            .setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0)))
            .toSigned();

        const signedTxHex = signedCommissionWithdrawTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a720a700a3b2f636f736d6f732e646973747269627574696f6e2e763162657461312e4d7367576974686472617756616c696461746f72436f6d6d697373696f6e12310a2f7463726f636e636c317265797368666479676637363733786d39703876307876746439366d3663643663616e68753312580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a020801180a120410c09a0c1a4006045a84d818932356613207e122d972d3af6b6757b2eef702cdd716e53c10cf478a8d639169f14551c9aa77ec928d817dfee5856d172b21d191f4a03d33b40f',
        );
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgWithdrawValidatorCommission', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() =>
                cro.distribution.MsgWithdrawValidatorCommission.fromCosmosMsgJSON(json, CroNetwork.Testnet),
            ).to.throw(
                'Expected /cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should throw Error when the `validator_address` field is missing', function () {
            const json = '{"@type":"/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission"}';
            expect(() =>
                cro.distribution.MsgWithdrawValidatorCommission.fromCosmosMsgJSON(json, CroNetwork.Testnet),
            ).to.throw(
                'Expected property `validatorAddress` to be of type `string` but received type `undefined` in object `commissionWithdrawalOptions`',
            );
        });

        it('should return the `MsgWithdrawValidatorCommission` corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission","validator_address":"tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3"}';

            const MsgWithdrawValidatorCommission = cro.distribution.MsgWithdrawValidatorCommission.fromCosmosMsgJSON(
                json,
                CroNetwork.Testnet,
            );
            expect(MsgWithdrawValidatorCommission.validatorAddress).to.eql(
                'tcrocncl1reyshfdygf7673xm9p8v0xvtd96m6cd6canhu3',
            );
        });
    });
});
