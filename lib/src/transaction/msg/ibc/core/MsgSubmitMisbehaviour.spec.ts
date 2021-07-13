import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';

import { fuzzyDescribe } from '../../../../test/mocha-fuzzy/suite';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../../keypair/secp256k1';
import { Bytes } from '../../../../utils/bytes/bytes';
import { CroSDK, CroNetwork } from '../../../../core/cro';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';

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

describe('Testing MsgSubmitMisbehaviour', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.ibc.MsgSubmitMisbehaviour(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgSubmitMisbehaviour conversion', function () {
        const MsgSubmitMisbehaviour = new cro.ibc.MsgSubmitMisbehaviour({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgSubmitMisbehaviour,
            value: {
                signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
                clientId: 'clientId',
                misbehaviour: undefined,
            },
        };

        expect(MsgSubmitMisbehaviour.toRawMsg()).to.deep.eq(rawMsg);
    });

    it('Test appendTxBody MsgSubmitMisbehaviour Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgSubmitMisbehaviour = new cro.ibc.MsgSubmitMisbehaviour({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            misbehaviour: undefined,
            clientId: 'clientId',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgSubmitMisbehaviour).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a660a640a292f6962632e636f72652e636c69656e742e76312e4d73675375626d69744d69736265686176696f757212370a08636c69656e7449641a2b7463726f313573667570643236737036716633376c6c3571367875663333306b37646639746e767271687412580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40b38eea165bd21573402b2cdf8093e28f6241fc27bcaa68fffbcba93f5e2a8dd01edb3d5c242499083d39bd9c11124d20a11a331eec638498b9abd5974c49563d',
        );
    });

    it('Should validate MsgSubmitMisbehaviour provided addresses with network config', function () {
        const params1 = {
            signer: 'cosmos1vw4ucaeagtduv5ep4sa95e3aqzqpsk5meda08c',
            misbehaviour: undefined,
            clientId: 'clientId',
        };

        expect(() => new cro.ibc.MsgSubmitMisbehaviour(params1)).to.throw(
            'Provided `signer` does not match network selected',
        );
    });

    it('Should throw on getting toRawAminoMsg()', function () {
        const MsgSubmitMisbehaviour = new cro.ibc.MsgSubmitMisbehaviour({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
        });

        expect(() => MsgSubmitMisbehaviour.toRawAminoMsg()).to.throw(
            'IBC Module not supported under amino encoding scheme',
        );
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a IBC MsgSubmitMisbehaviour', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.ibc.MsgSubmitMisbehaviour.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /ibc.core.client.v1.MsgSubmitMisbehaviour but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw on invalid `signer`', function () {
            const json = `
              {
                "@type": "/ibc.core.client.v1.MsgSubmitMisbehaviour",
                "signer": "cosmos1u8prj0rj3ur7kr23dhjgyteuq55ntahfuzlf6g",
                "client_id": "07-tendermint-33"
              }
            `;

            expect(() => cro.ibc.MsgSubmitMisbehaviour.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Provided `signer` does not match network selected',
            );
        });
        it('should throw on invalid `clientId`', function () {
            const json = `
              {
                "@type": "/ibc.core.client.v1.MsgSubmitMisbehaviour",
                "signer": "cosmos1u8prj0rj3ur7kr23dhjgyteuq55ntahfuzlf6g"
              }
            `;

            expect(() => cro.ibc.MsgSubmitMisbehaviour.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `clientId` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw on non-empty field `misbehaviour`', function () {
            const json = `
            {
                "@type": "/ibc.core.client.v1.MsgSubmitMisbehaviour",
                "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                "client_id": "07-tendermint-33",
                "misbehaviour": {"type": "07-tendermint-33"}
            }
            `;

            expect(() => cro.ibc.MsgSubmitMisbehaviour.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'IBC MsgSubmitMisbehaviour does not support `misbehaviour` decoding.',
            );
        });
        it('should return the IBC MsgSubmitMisbehaviour corresponding to the JSON', function () {
            const json = `{
                    "@type": "/ibc.core.client.v1.MsgSubmitMisbehaviour",
                    "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                    "client_id": "07-tendermint-33"
                }
                `;

            const MsgSubmitMisbehaviour = cro.ibc.MsgSubmitMisbehaviour.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgSubmitMisbehaviour.signer).to.eql('tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8');
            expect(MsgSubmitMisbehaviour.clientId).to.eql('07-tendermint-33');
            expect(MsgSubmitMisbehaviour.misbehaviour).to.be.null;
        });
    });
});
