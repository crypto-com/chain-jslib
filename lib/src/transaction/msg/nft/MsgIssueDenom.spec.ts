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

describe('Testing MsgIssueDenom', function () {
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
            expect(() => new cro.nft.MsgIssueDenom(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('should throw Error when the denom id is invalid', function () {
        const anyName = 'anyName';
        const anySchema = 'anySchema';
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';

        // < 3 characters
        expect(
            () =>
                new cro.nft.MsgIssueDenom({
                    id: 'a',
                    name: anyName,
                    schema: anySchema,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `id` to have a minimum length of `3`, got `a` in object `options`');
        // > 64 characters
        expect(
            () =>
                new cro.nft.MsgIssueDenom({
                    id: 'a123456789012345567890123456789012345678901234567890123456789012345',
                    name: anyName,
                    schema: anySchema,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to have a maximum length of `64`, got `a123456789012345567890123456789012345678901234567890123456789012345` in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgIssueDenom({
                    id: '123',
                    name: anyName,
                    schema: anySchema,
                    sender: anySender,
                }),
        ).to.throw('Expected property string `id` to start with lowercase alphabets in object `options`');
        expect(
            () =>
                new cro.nft.MsgIssueDenom({
                    id: 'aBC',
                    name: anyName,
                    schema: anySchema,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
        expect(
            () =>
                new cro.nft.MsgIssueDenom({
                    id: 'abc_123',
                    name: anyName,
                    schema: anySchema,
                    sender: anySender,
                }),
        ).to.throw(
            'Expected property string `id` to contain only lowercase alphanumeric characters in object `options`',
        );
    });

    it('Should throw when denomName and URI is invalid', function () {
        const anyName = '      '; // String only of whitespaces
        const anySender = 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3';
        expect(
            () =>
                new cro.nft.MsgIssueDenom({
                    id: 'abc',
                    name: anyName,
                    schema: 'anySchema',
                    sender: anySender,
                }),
        ).to.throw('Expected property string `name` to be non-empty string in object `options`');
    });

    it('Test MsgIssueDenom conversion', function () {
        const MsgIssueDenom = new cro.nft.MsgIssueDenom({
            id: 'alphanumericid123',
            name: 'nft_name',
            schema: 'schema',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        });

        const rawMsg: Msg = {
            typeUrl: COSMOS_MSG_TYPEURL.nft.MsgIssueDenom,
            value: {
                id: 'alphanumericid123',
                name: 'nft_name',
                schema: 'schema',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            },
        };

        expect(MsgIssueDenom.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test MsgIssueDenom conversion Json', function () {
        const msgIssueDenom = new cro.nft.MsgIssueDenom({
            id: 'alphanumericid123',
            name: 'nft_name',
            schema: 'schema',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        });

        const rawMsg: legacyAmino.Msg = {
            type: 'chainmain/nft/MsgIssueDenom',
            value: {
                id: 'alphanumericid123',
                name: 'nft_name',
                schema: 'schema',
                sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            },
        };

        expect(msgIssueDenom.toRawAminoMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgIssueDenom Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgIssueDenom = new cro.nft.MsgIssueDenom({
            id: 'alphanumericid123',
            name: 'nft_name',
            schema: 'schema',
            sender: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(MsgIssueDenom).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0a770a750a1f2f636861696e6d61696e2e6e66742e76312e4d7367497373756544656e6f6d12520a11616c7068616e756d65726963696431323312086e66745f6e616d651a06736368656d61222b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b633312580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40045f697ff11da324dd522bcfa50ef6f1c606bd7c7105aba9e7710de0dac15241267973fa680208581e6c5b888d9441443173ab62d5090c88c81869760456a0bb',
        );
    });

    it('Should validate MsgIssueDenom provided addresses with network config', function () {
        const params1 = {
            id: 'alphanumericid123',
            name: 'nft_name',
            schema: 'schema',
            sender: 'cro1pndm4ywdf4qtmupa0fqe75krmqed2znjyj6x8f',
        };

        expect(() => new cro.nft.MsgIssueDenom(params1)).to.throw('Provided `sender` does not match network selected');
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgIssueDenom', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.nft.MsgIssueDenom.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /chainmain.nft.v1.MsgIssueDenom but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });
        it('should throw Error when the `id` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgIssueDenom","name":"nft_name","schema":"schema","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgIssueDenom.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `id` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `name` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgIssueDenom","id":"alphanumericid123","schema":"schema","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgIssueDenom.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `name` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `schema` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgIssueDenom","id":"alphanumericid123","name":"nft_name","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            expect(() => cro.nft.MsgIssueDenom.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `schema` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `sender` field is missing', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgIssueDenom","id":"alphanumericid123","name":"nft_name","schema":"schema"}';
            expect(() => cro.nft.MsgIssueDenom.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `sender` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should return the MsgIssueDenom corresponding to the JSON', function () {
            const json =
                '{"@type":"/chainmain.nft.v1.MsgIssueDenom","id":"alphanumericid123","name":"nft_name","schema":"schema","sender":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3"}';
            const MsgIssueDenom = cro.nft.MsgIssueDenom.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgIssueDenom.id).to.eql('alphanumericid123');
            expect(MsgIssueDenom.name.toString()).to.eql('nft_name');
            expect(MsgIssueDenom.schema.toString()).to.eql('schema');
            expect(MsgIssueDenom.sender.toString()).to.eql('tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3');
        });
    });
});
