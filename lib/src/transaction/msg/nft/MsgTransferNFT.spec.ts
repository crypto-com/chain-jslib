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

describe('Testing MsgTransferNFT', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            id: 'alphaNumericID',
            name: 'nft_name',
            schema: 'schema',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        };

        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.nft.MsgTransferNFT(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('should throw Error when the token id is invalid', function () {
        const anyDenomId = 'anydenomid';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';
        const anyRecipient = 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    id: 'a',
                    denomId: anyDenomId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `id` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    id: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    denomId: anyDenomId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    id: '123',
                    denomId: anyDenomId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `id` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    id: 'aBC',
                    denomId: anyDenomId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    id: 'abc_123',
                    denomId: anyDenomId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('should throw Error when the denom id is invalid', function () {
        const anyTokenId = 'anytokenid';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';
        const anyRecipient = 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    denomId: 'a',
                    id: anyTokenId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `denomId` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    denomId: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    id: anyTokenId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `denomId` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    denomId: '123',
                    id: anyTokenId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `denomId` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    denomId: 'aBC',
                    id: anyTokenId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `denomId` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgTransferNFT({
                    denomId: 'abc_123',
                    id: anyTokenId,
                    recipient: anyRecipient,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `denomId` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('Test MsgTransferNFT conversion', function () {
        const MsgTransferNFT = new cro.nft.MsgTransferNFT({
            id: 'alphanumericid1234',
            denomId: 'basetcro',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.nft.MsgTransferNFT,
            value: {
                id: 'alphanumericid1234',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                denomId: 'basetcro',
                recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            },
        };

        expect(MsgTransferNFT.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test MsgTransferNFT conversion Json', function () {
        const msgTransferNFT = new cro.nft.MsgTransferNFT({
            id: 'alphanumericid1234',
            denomId: 'basetcro',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        });

        const rawMsg: legacyAmino.Msg = {
            type: 'chainmain/nft/MsgTransferNFT',
            value: {
                id: 'alphanumericid1234',
                denom_id: 'basetcro',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            },
        };

        expect(msgTransferNFT.toRawAminoMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgTransferNFT Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgTransferNFT = new cro.nft.MsgTransferNFT({
            id: 'alphanumericid1234',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            denomId: 'basetcro',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgTransferNFT).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a9f010a9c010a202f636861696e6d61696e2e6e66742e76312e4d73675472616e736665724e465412780a12616c7068616e756d657269636964313233341208626173657463726f1a2b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b6333222b7463726f316a3770656a386b706c656d347774353070346866766e64687577356a707278786e353632357112580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40fef11b190713be10e984af75cbaf6ee0bc23dbb7a34417815f2ef283dd7417963217f9911bd73f8bd9de37ba23badd314d770cf33dbec016c06213275573bdbb',
        );
    });

    it('Should validate MsgTransferNFT provided addresses with network config', function () {
        const params1 = {
            id: 'alphanumericid1234',
            sender: 'cro1pndm4ywdf4qtmupa0fqe75krmqed2znjyj6x8f',
            denomId: 'basetcro',
            recipient: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
        };

        expect(() => new cro.nft.MsgTransferNFT(params1)).to.throw('Provided `sender` does not match network selected');

        const params2 = {
            id: 'alphanumericid1234',
            sender: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            denomId: 'basetcro',
            recipient: 'cro1pndm4ywdf4qtmupa0fqe75krmqed2znjyj6x8f',
        };

        expect(() => new cro.nft.MsgTransferNFT(params2)).to.throw(
            'Provided `recipient` does not match network selected',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgTransferNFT', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.nft.MsgTransferNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /chainmain.nft.v1.MsgTransferNFT but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `id` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgTransferNFT","denom_id":"nft123","recipient":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgTransferNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `id` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `denom_id` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgTransferNFT","id":"alphanumericid123","recipient":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgTransferNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `denomId` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `recipient` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgTransferNFT","id":"alphanumericid123","denom_id":"nft123","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgTransferNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `recipient` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `sender` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgTransferNFT","id":"alphanumericid123","denom_id":"nft123","recipient":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgTransferNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `sender` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should return the MsgTransferNFT corresponding to the JSON', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgTransferNFT","id":"alphanumericid123","denom_id":"nft123","recipient":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            const MsgTransferNFT = cro.nft.MsgTransferNFT.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgTransferNFT.id).to.eql('alphanumericid123');
            expect(MsgTransferNFT.denomId.toString()).to.eql('nft123');
            expect(MsgTransferNFT.recipient.toString()).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
            expect(MsgTransferNFT.sender.toString()).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
        });
    });
});
