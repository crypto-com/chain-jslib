import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';

import { fuzzyDescribe } from '../../../../test/mocha-fuzzy/suite';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../../keypair/secp256k1';
import { Bytes } from '../../../../utils/bytes/bytes';
import { CroSDK, CroNetwork } from '../../../../core/cro';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { google } from '../../../../cosmos/v1beta1/codec';

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

describe('Testing MsgUpgradeClient', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.ibc.MsgUpgradeClient(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgUpgradeClient conversion', function () {
        const MsgUpgradeClient = new cro.ibc.MsgUpgradeClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
            proofUpgradeConsensusState: new Uint8Array([1, 2]),
            proofUpgradeClient: new Uint8Array([3, 4]),
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgUpgradeClient,
            value: {
                signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
                clientId: 'clientId',
                clientState: undefined,
                proofUpgradeConsensusState: new Uint8Array([1, 2]),
                proofUpgradeClient: new Uint8Array([3, 4]),
            },
        };

        expect(MsgUpgradeClient.toRawMsg()).to.deep.eq(rawMsg);
    });

    it('Test appendTxBody MsgUpgradeClient Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgUpgradeClient = new cro.ibc.MsgUpgradeClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
            proofUpgradeClient: new Uint8Array([1]),
            proofUpgradeConsensusState: new Uint8Array([1]),
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgUpgradeClient).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a670a650a242f6962632e636f72652e636c69656e742e76312e4d736755706772616465436c69656e74123d0a08636c69656e7449642201012a0101322b7463726f313573667570643236737036716633376c6c3571367875663333306b37646639746e767271687412580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40e348e90785dfac9d7f9504bdbc935c3259802eea7710fa51cc3a6631ef5c599723dbcfaa8db94e6f4c7ac4441b2d0b8da445d7438e1190d27da2fc144922d09c',
        );
    });

    it('Should validate MsgUpgradeClient provided addresses with network config', function () {
        const params1 = {
            signer: 'cosmos1vw4ucaeagtduv5ep4sa95e3aqzqpsk5meda08c',
            clientState: google.protobuf.Any.create({
                type_url: '/some.valid.type.url',
                value: new Uint8Array([1, 2, 35, 5]),
            }),
            consensusState: google.protobuf.Any.create({
                type_url: '/some.valid.type.url',
                value: new Uint8Array([1, 2, 35, 5]),
            }),
            clientId: 'clientId',
            proofUpgradeClient: new Uint8Array(),
            proofUpgradeConsensusState: new Uint8Array(),
        };

        expect(() => new cro.ibc.MsgUpgradeClient(params1)).to.throw(
            'Provided `signer` does not match network selected',
        );
    });

    it('Should throw on getting toRawAminoMsg()', function () {
        const MsgUpgradeClient = new cro.ibc.MsgUpgradeClient({
            signer: 'tcro15sfupd26sp6qf37ll5q6xuf330k7df9tnvrqht',
            clientId: 'clientId',
            proofUpgradeClient: new Uint8Array(),
            proofUpgradeConsensusState: new Uint8Array(),
        });

        expect(() => MsgUpgradeClient.toRawAminoMsg()).to.throw('IBC Module not supported under amino encoding scheme');
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a IBC MsgUpgradeClient', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /ibc.core.client.v1.MsgUpgradeClient but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw on missing field `signer`', function () {
            const json = `{
                "@type": "/ibc.core.client.v1.MsgUpgradeClient",
                "client_id": "07-tendermint-33",
                "proof_upgrade_client": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8=",
                "proof_upgrade_consensus_state": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="
            }
            `;

            expect(() => cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `signer` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw on non-empty `clientState`', function () {
            const json = `{
                "@type": "/ibc.core.client.v1.MsgUpgradeClient",
                "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                "client_id": "07-tendermint-33",
                "client_state": {"typeurl":"07-tendermint-33"},
                "proof_upgrade_client": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8=",
                "proof_upgrade_consensus_state": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="
            }
            `;

            expect(() => cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'IBC MsgUpgradeClient does not support `client_state` decoding.',
            );
        });

        it('should throw on non-empty `consensus_state`', function () {
            const json = `{
                "@type": "/ibc.core.client.v1.MsgUpgradeClient",
                "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                "client_id": "07-tendermint-33",
                "consensus_state": {"typeurl":"07-tendermint-33"},
                "proof_upgrade_client": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8=",
                "proof_upgrade_consensus_state": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="
            }
            `;

            expect(() => cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'IBC MsgUpgradeClient does not support `consensus_state` decoding.',
            );
        });
        it('should throw on invalid `signer`', function () {
            const json = `{
                "@type": "/ibc.core.client.v1.MsgUpgradeClient",
                "signer": "cosmos1u8prj0rj3ur7kr23dhjgyteuq55ntahfuzlf6g",
                "client_id": "07-tendermint-33",
                "proof_upgrade_client": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8=",
                "proof_upgrade_consensus_state": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="
            }
            `;

            expect(() => cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Provided `signer` does not match network selected',
            );
        });
        it('should throw on invalid `clientId`', function () {
            const json = `{
                "@type": "/ibc.core.client.v1.MsgUpgradeClient",
                "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                "proof_upgrade_client": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8=",
                "proof_upgrade_consensus_state": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="
            }
            `;

            expect(() => cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `clientId` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should return the IBC MsgUpgradeClient corresponding to the JSON', function () {
            const json = `{
                    "@type": "/ibc.core.client.v1.MsgUpgradeClient",
                    "signer": "tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8",
                    "client_id": "07-tendermint-33",
                    "proof_upgrade_client": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8=",
                    "proof_upgrade_consensus_state": "EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="
                }
                `;

            const MsgUpgradeClient = cro.ibc.MsgUpgradeClient.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgUpgradeClient.signer).to.eql('tcro1agr5hwr6gxljf4kpg6fm7l7ehjxtyazg86nef8');
            expect(MsgUpgradeClient.clientId).to.eql('07-tendermint-33');
            expect(typeof MsgUpgradeClient.consensusState).to.eq('undefined');
            expect(MsgUpgradeClient.clientState).to.be.null;
        });
    });
});
