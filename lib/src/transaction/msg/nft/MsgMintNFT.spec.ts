/* eslint-disable camelcase */
// @ts-nocheck
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
        chainId: 'testnet',
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

describe('Testing MsgMintNFT', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            id: 'alphanumericid',
            name: 'nft_name',
            schema: 'schema',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.nft.MsgMintNFT(options.value)).to.throw('Expected `options` to be of type `object`');
        });
    });

    it('should throw Error when the token id is invalid', function () {
        const anyDenomId = 'anydenomid';
        const anyName = 'anyname';
        const anyUri = 'anyuri';
        const anyData = 'anydata';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';
        const anyRecipient = 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    id: 'a',
                    name: anyName,
                    sender: anySender,
                    denomId: anyDenomId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw('Expected property string `id` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    id: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    name: anyName,
                    sender: anySender,
                    denomId: anyDenomId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `id` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    id: '123',
                    name: anyName,
                    sender: anySender,
                    denomId: anyDenomId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw('Expected property string `id` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    id: 'aBC',
                    name: anyName,
                    sender: anySender,
                    denomId: anyDenomId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    id: 'abc_123',
                    name: anyName,
                    sender: anySender,
                    denomId: anyDenomId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('should throw Error when the denom id is invalid', function () {
        const anyTokenId = 'anytokenid';
        const anyName = 'anyname';
        const anyUri = 'anyuri';
        const anyData = 'anydata';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';
        const anyRecipient = 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: 'a',
                    name: anyName,
                    sender: anySender,
                    id: anyTokenId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw('Expected property string `denomId` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    name: anyName,
                    sender: anySender,
                    id: anyTokenId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `denomId` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: '123',
                    name: anyName,
                    sender: anySender,
                    id: anyTokenId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw('Expected property string `denomId` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: 'aBC',
                    name: anyName,
                    sender: anySender,
                    id: anyTokenId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `denomId` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: 'abc_123',
                    name: anyName,
                    sender: anySender,
                    id: anyTokenId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `denomId` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('Should throw when denomName and URI is invalid', function () {
        const anyTokenId = 'anytokenid';
        const anyName = '      '; // String only of whitespaces
        const anyUri = 'anyuri';
        const anyData = 'anydata';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';
        const anyRecipient = 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q';
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: 'abc123',
                    name: anyName,
                    sender: anySender,
                    id: anyTokenId,
                    uri: anyUri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw('Expected property string `name` to be non-empty string in object `options`');

        const invalid_uri =
            'Iamrandomstringoflengthmorethan2560ac6010ac3010a1c2f636861696e6d61696e2e6e66742e76312e4d73674d696e744e465412a2010a12616c7068616e756d657269636964313233341208626173657463726f1a086e66745f6e616d65220f68747470733a2f2f736f6d657572692a0d736f6d655f646174615f6e6674322b7463726f313635747a63726832796c383367';
        expect(
            () =>
                new cro.nft.MsgMintNFT({
                    denomId: 'abc123',
                    name: 'anyName',
                    sender: anySender,
                    id: anyTokenId,
                    uri: invalid_uri,
                    data: anyData,
                    recipient: anyRecipient,
                }),
        ).to.throw(
            'Expected property string `uri` to have a maximum length of `256`, got `Iamrandomstringoflengthmorethan2560ac6010ac3010a1c2f636861696e6d61696e2e6e66742e76312e4d73674d696e744e465412a2010a12616c7068616e756d657269636964313233341208626173657463726f1a086e66745f6e616d65220f68747470733a2f2f736f6d657572692a0d736f6d655f646174615f6e6674322b7463726f313635747a63726832796c383367` in object `options`',
        );
    });

    it('Test MsgMintNFT conversion', function () {
        const MsgMintNFT = new cro.nft.MsgMintNFT({
            id: 'alphanumericid1234',
            name: 'nft_name',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            denomId: 'basetcro',
            uri: 'https://someuri',
            data: 'some_data_nft',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.nft.MsgMintNFT,
            value: {
                id: 'alphanumericid1234',
                name: 'nft_name',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                denomId: 'basetcro',
                uri: 'https://someuri',
                data: 'some_data_nft',
                recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            },
        };

        expect(MsgMintNFT.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test MsgMintNFT conversion Json', function () {
        const msgMintNFT = new cro.nft.MsgMintNFT({
            id: 'alphanumericid1234',
            name: 'nft_name',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            denomId: 'basetcro',
            uri: 'https://someuri',
            data: 'some_data_nft',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        });

        const rawMsg: legacyAmino.Msg = {
            type: 'chainmain/nft/MsgMintNFT',
            value: {
                id: 'alphanumericid1234',
                name: 'nft_name',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                denom_id: 'basetcro',
                uri: 'https://someuri',
                data: 'some_data_nft',
                recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            },
        };

        expect(msgMintNFT.toRawAminoMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgMintNFT Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgMintNFT = new cro.nft.MsgMintNFT({
            id: 'alphanumericid1234',
            name: 'nft_name',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            denomId: 'basetcro',
            uri: 'https://someuri',
            data: 'some_data_nft',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgMintNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0ac6010ac3010a1c2f636861696e6d61696e2e6e66742e76312e4d73674d696e744e465412a2010a12616c7068616e756d657269636964313233341208626173657463726f1a086e66745f6e616d65220f68747470733a2f2f736f6d657572692a0d736f6d655f646174615f6e6674322b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b63333a2b7463726f316a3770656a386b706c656d347774353070346866766e64687577356a707278786e353632357112580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40b030ef585838ea7abe2157c811412d9c4066a4ff628a5497d96ecf327396ea4d58e601fc784d8f4ad8c6f2c7dad41b4b2291fd8d7510024841a54f302053a24f',
        );
    });

    it('Should validate MsgMintNFT provided addresses with network config', function () {
        const params1 = {
            id: 'alphanumericid1234',
            name: 'nft_name',
            sender: 'cro1pndm4ywdf4qtmupa0fqe75krmqed2znjyj6x8f',
            denomId: 'basetcro',
            uri: 'https://someuri',
            data: 'some_data_nft',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        };

        expect(() => new cro.nft.MsgMintNFT(params1)).to.throw('Provided `sender` does not match network selected');

        const params2 = {
            id: 'alphanumericid1234',
            name: 'nft_name',
            sender: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            denomId: 'basetcro',
            uri: 'https://someuri',
            data: 'some_data_nft',
            recipient: 'cro1pndm4ywdf4qtmupa0fqe75krmqed2znjyj6x8f',
        };

        expect(() => new cro.nft.MsgMintNFT(params2)).to.throw('Provided `recipient` does not match network selected');
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgMintNFT', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /chainmain.nft.v1.MsgMintNFT but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `id` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","denom_id":"basetcro","name":"nft_name","uri":"https://someuri","data":"some_data_nft","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `id` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `name` or `denom_id` field is missing', function () {
            // name missing
            const json =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","denom_id":"basetcro","uri":"https://someuri","data":"some_data_nft","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `name` to be of type `string` but received type `undefined` in object `options`',
            );

            // denom_id missing
            const json1 =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","name":"nft_name","uri":"https://someuri","data":"some_data_nft","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json1, CroNetwork.Testnet)).to.throw(
                'Expected property `denomId` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `data` or `uri` field is missing', function () {
            // data missing
            const json =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","denom_id":"basetcro","name":"nft_name","uri":"https://someuri","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `data` to be of type `string` but received type `undefined` in object `options`',
            );

            // uri missing
            const json1 =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","denom_id":"basetcro","name":"nft_name","data":"some_data_nft","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json1, CroNetwork.Testnet)).to.throw(
                'Expected property `uri` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `sender` or `recipient` field is missing', function () {
            // sender missing
            const json =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","denom_id":"basetcro","name":"nft_name","uri":"https://someuri","data":"some_data_nft","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `sender` to be of type `string` but received type `undefined` in object `options`',
            );

            // recipient missing
            const json1 =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","denom_id":"basetcro","name":"nft_name","uri":"https://someuri","data":"some_data_nft","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgMintNFT.fromCosmosMsgJSON(json1, CroNetwork.Testnet)).to.throw(
                'Expected property `recipient` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should return the MsgMintNFT corresponding to the JSON', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgMintNFT","id":"alphanumericid1234","denom_id":"basetcro","name":"nft_name","uri":"https://someuri","data":"some_data_nft","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","recipient":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q"}';
            const MsgMintNFT = cro.nft.MsgMintNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgMintNFT.id).to.eql('alphanumericid1234');
            expect(MsgMintNFT.denomId).to.eql('basetcro');
            expect(MsgMintNFT.name.toString()).to.eql('nft_name');
            expect(MsgMintNFT.uri.toString()).to.eql('https://someuri');
            expect(MsgMintNFT.sender.toString()).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
            expect(MsgMintNFT.recipient.toString()).to.eql('tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q');
        });
    });
});
