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

describe('Testing MsgUpdateClient', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.ibc.MsgUpdateClient(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgUpdateClient conversion', function () {
        const MsgUpdateClient = new cro.ibc.MsgUpdateClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
            header: null,
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgUpdateClient,
            value: {
                signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
                clientId: 'clientId',
                header: null,
            },
        };

        expect(MsgUpdateClient.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgUpdateClient Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgUpdateClient = new cro.ibc.MsgUpdateClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            header: undefined,
            clientId: 'clientId',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgUpdateClient).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a600a5e0a232f6962632e636f72652e636c69656e742e76312e4d7367557064617465436c69656e7412370a08636c69656e7449641a2b7463726f313573667570643236737036716633376c6c3571367875663333306b37646639746e767271687412580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40c8529d07e0c51b9d14a2fc77475c6ffbefd4fed6305392f5979f489164e6102546f3e5c537fcbee75587e36eb0206326639c6807d0e2afd1d1c3c3c16e7ec5ec',
        );
    });

    it('Should validate MsgUpdateClient provided addresses with network config', function () {
        const params1 = {
            signer: 'cosmos1vw4ucaeagtduv5ep4sa95e3aqzqpsk5meda08c',
            clientId: 'clientId',
        };

        expect(() => new cro.ibc.MsgUpdateClient(params1)).to.throw(
            'Provided `signer` does not match network selected',
        );
    });

    it('Should throw on getting toRawAminoMsg()', function () {
        const MsgUpdateClient = new cro.ibc.MsgUpdateClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
        });

        expect(() => MsgUpdateClient.toRawAminoMsg()).to.throw('IBC Module not supported under amino encoding scheme');
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a IBC MsgUpdateClient', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.ibc.MsgUpdateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /ibc.core.client.v1.MsgUpdateClient but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw on invalid `signer`', function () {
            const json = `
              {
                "@type": "/ibc.core.client.v1.MsgUpdateClient",
                "signer": "cosmos1u8prj0rj3ur7kr23dhjgyteuq55ntahfuzlf6g",
                "client_id": "07-tendermint-33"
              }
            `;

            expect(() => cro.ibc.MsgUpdateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Provided `signer` does not match network selected',
            );
        });
        it('should throw on invalid `clientId`', function () {
            const json = `
              {
                "@type": "/ibc.core.client.v1.MsgUpdateClient",
                "signer": "cosmos1u8prj0rj3ur7kr23dhjgyteuq55ntahfuzlf6g"
              }
            `;

            expect(() => cro.ibc.MsgUpdateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `clientId` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should return the IBC MsgUpdateClient corresponding to the JSON', function () {
            const json = `{
                    "@type": "/ibc.core.client.v1.MsgUpdateClient",
                    "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                    "client_id": "07-tendermint-33"
                }
                `;

            const MsgUpdateClient = cro.ibc.MsgUpdateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgUpdateClient.signer).to.eql('tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8');
            expect(MsgUpdateClient.clientId).to.eql('07-tendermint-33');
            expect(MsgUpdateClient.header).to.be.null;
        });
    });
});
