/* eslint-disable camelcase */
import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';

import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Bytes } from '../../../utils/bytes/bytes';
import { CroSDK, CroNetwork } from '../../../core/cro';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
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

describe('Testing MsgBurnNFT', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            id: 'alphanumericid',
            denomId: 'basetcro',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.nft.MsgBurnNFT(options.value)).to.throw('Expected `options` to be of type `object`');
        });
    });

    it('should throw Error when the token id is invalid', function () {
        const anyDenomId = 'anydenomid';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    id: 'a',
                    denomId: anyDenomId,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `id` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    id: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    denomId: anyDenomId,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    id: '123',
                    denomId: anyDenomId,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `id` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    id: 'aBC',
                    denomId: anyDenomId,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    id: 'abc_123',
                    denomId: anyDenomId,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('should throw Error when the denom id is invalid', function () {
        const anyTokenId = 'anytokenid';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    denomId: 'a',
                    id: anyTokenId,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `denomId` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    denomId: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    id: anyTokenId,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `denomId` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    denomId: '123',
                    id: anyTokenId,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `denomId` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    denomId: 'aBC',
                    id: anyTokenId,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `denomId` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgBurnNFT({
                    denomId: 'abc_123',
                    id: anyTokenId,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `denomId` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('Test MsgBurnNFT conversion', function () {
        const MsgBurnNFT = new cro.nft.MsgBurnNFT({
            id: 'alphanumericid123',
            denomId: 'basetcro',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.nft.MsgBurnNFT,
            value: {
                id: 'alphanumericid123',
                denomId: 'basetcro',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            },
        };

        expect(MsgBurnNFT.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test MsgMintNFT conversion Json', function () {
        const msgBurnNFT = new cro.nft.MsgBurnNFT({
            id: 'alphanumericid123',
            denomId: 'basetcro',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        });

        const rawMsg: legacyAmino.Msg = {
            type: 'chainmain/nft/MsgBurnNFT',
            value: {
                id: 'alphanumericid123',
                denom_id: 'basetcro',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            },
        };

        expect(msgBurnNFT.toRawAminoMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgBurnNFT Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgBurnNFT = new cro.nft.MsgBurnNFT({
            id: 'alphanumericid123',
            denomId: 'basetcro',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgBurnNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a6c0a6a0a1c2f636861696e6d61696e2e6e66742e76312e4d73674275726e4e4654124a0a11616c7068616e756d6572696369643132331208626173657463726f1a2b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b633312580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a4044b030b0b3dd2873ac5306f7272f1645b1dc4d457a5a66829ce2567f9109d8ef39d8a6d7c7cf978996daa7d9222ffcd11b737044d511f185d1d6dfee0f9e400f',
        );
    });

    it('Should validate MsgBurnNFT provided addresses with network config', function () {
        const params1 = {
            id: 'alphanumericid123',
            denomId: 'basetcro',
            sender: 'cro1pndm4ywdf4qtmupa0fqe75krmqed2znjyj6x8f',
        };

        expect(() => new cro.nft.MsgBurnNFT(params1)).to.throw('Provided `sender` does not match network selected');
    });

    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgBurnNFT', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.nft.MsgBurnNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /chainmain.nft.v1.MsgBurnNFT but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `id` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgBurnNFT","denom_id":"nft123","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgBurnNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `id` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `denom_id` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgBurnNFT","id":"alphanumericid123","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgBurnNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `denomId` to be of type `string` but received type `undefined` in object `options`',
            );
        });

        it('should throw Error when the `sender` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgBurnNFT","id":"alphanumericid123","denom_id":"nft123","recipient":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgBurnNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `sender` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should return the MsgBurnNFT corresponding to the JSON', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgBurnNFT","id":"alphanumericid123","denom_id":"nft123", "sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            const MsgBurnNFT = cro.nft.MsgBurnNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgBurnNFT.id).to.eql('alphanumericid123');
            expect(MsgBurnNFT.denomId.toString()).to.eql('nft123');
            expect(MsgBurnNFT.sender.toString()).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
        });
    });
});
