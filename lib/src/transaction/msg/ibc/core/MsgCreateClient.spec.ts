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

describe('Testing MsgCreateClient', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.ibc.MsgCreateClient(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgCreateClient conversion', function () {
        const MsgCreateClient = new cro.ibc.MsgCreateClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgCreateClient,
            value: {
                signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
                clientState: undefined,
                consensusState: undefined,
            },
        };

        expect(MsgCreateClient.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgCreateClient Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgCreateClient = new cro.ibc.MsgCreateClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientState: undefined,
            consensusState: undefined,
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgCreateClient).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a560a540a232f6962632e636f72652e636c69656e742e76312e4d7367437265617465436c69656e74122d1a2b7463726f313573667570643236737036716633376c6c3571367875663333306b37646639746e767271687412580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a4015d479781ae26136f291374111f39c137d363c6fd466d3694d17db9cac18e9852dd87f9ffb1c56a80e96c11051d51f1eb3d06b0929f715c6e0c99b78fd89f7eb',
        );
    });

    it('Should validate MsgCreateClient provided addresses with network config', function () {
        const params1 = {
            signer: 'cosmos1vw4ucaeagtduv5ep4sa95e3aqzqpsk5meda08c',
        };

        expect(() => new cro.ibc.MsgCreateClient(params1)).to.throw(
            'Provided `signer` does not match network selected',
        );
    });

    it('Should throw on getting toRawAminoMsg()', function () {
        const MsgCreateClient = new cro.ibc.MsgCreateClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
        });

        expect(() => MsgCreateClient.toRawAminoMsg()).to.throw('IBC Module not supported under amino encoding scheme');
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a IBC MsgCreateClient', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.ibc.MsgCreateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /ibc.core.client.v1.MsgCreateClient but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw on invalid `sender`', function () {
            const json = `
              {
                "@type": "/ibc.core.client.v1.MsgCreateClient",
                "signer": "cosmos1u8prj0rj3ur7kr23dhjgyteuq55ntahfuzlf6g"
              }
            `;

            expect(() => cro.ibc.MsgCreateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Provided `signer` does not match network selected',
            );
        });
        it('should return the IBC MsgCreateClient corresponding to the JSON', function () {
            const json = `{
                    "@type": "/ibc.core.client.v1.MsgCreateClient",
                    "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8"
                  }
                `;

            const MsgCreateClient = cro.ibc.MsgCreateClient.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgCreateClient.signer).to.eql('tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8');
        });
    });
});
