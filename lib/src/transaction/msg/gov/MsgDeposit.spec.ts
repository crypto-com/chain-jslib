import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';
import Long from 'long';

import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Units } from '../../../coin/coin';
import { CroSDK, CroNetwork } from '../../../core/cro';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { HDKey } from '../../../hdkey/hdkey';

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

describe('Testing MsgDeposit', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            proposalId: Big(1244000),
            depositor: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            amount: new cro.Coin('1200', Units.BASE),
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.gov.MsgDeposit(options.value)).to.throw('Expected `options` to be of type `object`');
        });
    });

    it('Test MsgDeposit conversion', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const msgDeposit = new cro.gov.MsgDeposit({
            proposalId: Big(1244000),
            depositor: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            amount: coin,
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.gov.v1beta1.MsgDeposit',
            value: {
                proposalId: Long.fromNumber(1244000, true),
                depositor: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
                amount: [
                    {
                        denom: 'basetcro',
                        amount: '12000500',
                    },
                ],
            },
        };
        expect(msgDeposit.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgDeposit Tx signing', function () {
        const hdKey = HDKey.fromMnemonic(
            'team school reopen cave banner pass autumn march immune album hockey region baby critic insect armor pigeon owner number velvet romance flight blame tone',
        );

        const privKey = hdKey.derivePrivKey("m/44'/1'/0'/0/0");
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const coin = new cro.Coin('12000500', Units.CRO);

        const msgDeposit = new cro.gov.MsgDeposit({
            proposalId: Big(1244000),
            depositor: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            amount: coin,
        });

        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(1250),
            accountSequence: new Big(0),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(msgDeposit).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a730a710a1e2f636f736d6f732e676f762e763162657461312e4d73674465706f736974124f08e0f64b122b7463726f3138346c7461326c7379753437767779703265387a6d746361336b3579713835703663347670331a1c0a08626173657463726f12103132303030353030303030303030303012580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a21030bf28c5f92c336db4703791691fa650fee408690b0a22c5ee4afb7e2508d32a712040a0208011800120410c09a0c1a40ba8c80028a85015ac737ca56603bef0a82e0fbd83f701ccbba02a4f381e5ee4a3d83af13cd02f1e9c1e8b386995d8468c2db1db73952c30fac6114004fe269c0',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgDeposit', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.gov.MsgDeposit.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.gov.v1beta1.MsgDeposit but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `proposal_id` field is missing', function () {
            const json =
                '{"@type":"/cosmos.gov.v1beta1.MsgDeposit","depositor":"tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3","amount":[{"amount": "1234567890", "denom":"basetcro"}]}';
            expect(() => cro.gov.MsgDeposit.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid `proposal_id` in JSON.',
            );
        });
        it('should throw Error when the `depositor` field is missing', function () {
            const json =
                '{"@type":"/cosmos.gov.v1beta1.MsgDeposit","proposal_id":"1244000","amount":[{"amount": "1234567890", "denom":"basetcro"}]}';
            expect(() => cro.gov.MsgDeposit.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `depositor` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `amount` field is missing', function () {
            const json =
                '{"@type":"/cosmos.gov.v1beta1.MsgDeposit","proposal_id":"1244000","depositor":"tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3"}';
            expect(() => cro.gov.MsgDeposit.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid amount in the Msg.',
            );
        });
        it('should return the MsgDeposit corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.gov.v1beta1.MsgDeposit","proposal_id":"1244000","depositor":"tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3","amount":[{"amount": "1234567890", "denom":"basetcro"}]}';
            const MsgDeposit = cro.gov.MsgDeposit.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgDeposit.depositor).to.eql('tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3');
            expect((MsgDeposit.proposalId as Big).toString()).to.eql('1244000');
            expect(MsgDeposit.amount.toCosmosCoin().amount).to.eql('1234567890');
            expect(MsgDeposit.amount.toCosmosCoin().denom).to.eql('basetcro');
        });
    });
});
