import 'mocha';
import { expect } from 'chai';
import { fuzzyDescribe } from '../test/mocha-fuzzy/suite';
import { SignableTransactionParamsSuiteFactory } from './test';
import { SignableTransaction } from './signable';
import { Bytes } from '../utils/bytes/bytes';

const anySignableTransaction = (): SignableTransaction => {
    const { params: anyParams } = SignableTransactionParamsSuiteFactory.build();
    return new SignableTransaction(anyParams);
};

describe('SignableTransaction', function () {
    describe('constructor', function () {
        fuzzyDescribe('should throw Error when params is invalid', function (fuzzy) {
            const { params: anyValidParams } = SignableTransactionParamsSuiteFactory.build();
            const testRunner = fuzzy(fuzzy.ObjArg(anyValidParams));

            testRunner(function (params) {
                if (params.valid) {
                    return;
                }
                expect(() => new SignableTransaction(params.value)).to.throw(
                    'Expected `params` to be of type `object`',
                );
            });
        });
    });

    describe('toSignDoc', function () {
        fuzzyDescribe('should throw Error when index is invalid', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.NumberArg(0));

            testRunner(function (index) {
                if (index.valid) {
                    return;
                }

                const anyTx = anySignableTransaction();
                expect(() => anyTx.toSignDoc(index.value)).to.throw('Expected `index` to be of type `number`');
            });
        });

        it('should throw Error when index is out of signers size', function () {
            const anyTx = anySignableTransaction();
            const outOfBoundIndex = 100;

            expect(() => anyTx.toSignDoc(outOfBoundIndex)).to.throw(
                'Expected `number `index`` to be within signer size',
            );
        });

        it('should return Bytes representation of SignDoc', function () {
            const anyTx = anySignableTransaction();

            expect(anyTx.toSignDoc(0)).to.be.an.instanceOf(Bytes);
        });
    });

    describe('toSignDocument', function () {
        fuzzyDescribe('should throw Error when index is invalid', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.NumberArg(0));

            testRunner(function (index) {
                if (index.valid) {
                    return;
                }

                const anyTx = anySignableTransaction();
                expect(() => anyTx.toSignDocument(index.value)).to.throw('Expected `index` to be of type `number`');
            });
        });

        it('should throw Error when index is out of signers size', function () {
            const anyTx = anySignableTransaction();
            const outOfBoundIndex = 100;
            expect(() => anyTx.toSignDocument(outOfBoundIndex)).to.throw(
                'Expected `number `index`` to be within signer size',
            );
        });

        it('should return Bytes representation of SignDoc', function () {
            const anyTx = anySignableTransaction();
            expect(anyTx.toSignDocument(0)).to.be.an.instanceOf(Bytes);
        });
    });

    describe('toSignDocumentHash', function () {
        fuzzyDescribe('should throw Error when index is invalid', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.NumberArg(0));

            testRunner(function (index) {
                if (index.valid) {
                    return;
                }

                const anyTx = anySignableTransaction();
                expect(() => anyTx.toSignDocumentHash(index.value)).to.throw('Expected `index` to be of type `number`');
            });
        });

        it('should throw Error when index is out of signers size', function () {
            const anyTx = anySignableTransaction();
            const outOfBoundIndex = 100;

            expect(() => anyTx.toSignDocumentHash(outOfBoundIndex)).to.throw(
                'Expected `number `index`` to be within signer size',
            );
        });

        it('should return Bytes representation of SignDoc', function () {
            const anyTx = anySignableTransaction();

            expect(anyTx.toSignDocumentHash(0)).to.be.an.instanceOf(Bytes);
        });
    });

    describe('setSignature', function () {
        fuzzyDescribe('should throw Error when index is invalid', function (fuzzy) {
            const anySignature = Bytes.fromHexString('111111');
            const testRunner = fuzzy(fuzzy.NumberArg(0), fuzzy.ObjArg(anySignature));

            testRunner(function (index, signature) {
                const anyTx = anySignableTransaction();
                if (!index.valid) {
                    expect(() => anyTx.setSignature(index.value, signature.value)).to.throw(
                        'Expected `index` to be of type `number`',
                    );
                } else if (!signature.valid) {
                    expect(() => anyTx.setSignature(index.value, signature.value)).to.throw(
                        'Expected `signature` to be of type `object`',
                    );
                }
            });
        });

        it('should throw Error when index is out of signers size', function () {
            const { keyPair, params: anyParams } = SignableTransactionParamsSuiteFactory.build();
            const anyTx = new SignableTransaction(anyParams);
            const signature = keyPair.sign(anyTx.toSignDocumentHash(0));

            const outOfBoundIndex = 100;
            expect(() => anyTx.setSignature(outOfBoundIndex, signature)).to.throw(
                'Expected `number `index`` to be within signer size',
            );
        });

        it('should throw Error when signature is invalid', function () {
            const anyTx = anySignableTransaction();
            const anyValidIndex = 0;
            const invalidSignature = Bytes.fromUint8Array(new Uint8Array(64).fill(1));

            expect(() => anyTx.setSignature(anyValidIndex, invalidSignature)).to.throw('Invalid signature');
        });

        it('should set the signature', function () {
            const { keyPair, params: anyParams } = SignableTransactionParamsSuiteFactory.build();
            const anyTx = new SignableTransaction(anyParams);
            const anyValidIndex = 0;
            const signature = keyPair.sign(anyTx.toSignDocumentHash(0));

            expect(anyTx.isIndexSigned(anyValidIndex)).to.eq(false);

            anyTx.setSignature(anyValidIndex, signature);
            expect(anyTx.isIndexSigned(anyValidIndex)).to.eq(true);
        });
    });

    describe('toCosmosJSON', function () {
        it('should throw', function () {
            const { params: anyParams } = SignableTransactionParamsSuiteFactory.build();
            const anyTx = new SignableTransaction(anyParams);
            // @ts-ignore
            anyTx.txRaw.authInfoBytes = undefined;

            expect(() => {
                anyTx.toCosmosJSON();
            }).to.throw('Error converting SignableTransaction to Cosmos compatible JSON.');
        });

        it('should not throw', function () {
            const anyTx = anySignableTransaction();
            expect(() => {
                anyTx.toCosmosJSON();
            }).not.throw();
        });

        it('should create correct JSON', function () {
            const anyTx = anySignableTransaction();
            const parsedCosmosJson = JSON.parse(anyTx.toCosmosJSON());
            // { "body": { "messages": [{ "@type": "/cosmos.bank.v1beta1.MsgSend", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }], "memo": "", "timeout_height": "0", "extension_options": [], "non_critical_extension_options": [] }, "auth_info": { "signer_infos": [{ "public_key": { "@type": "/cosmos.crypto.secp256k1.PubKey", "key": "Ap/w6zWJiX6QCKLTt6jLM1sFJsUmBWaS6VUi7zxqqb0V" }, "mode_info": { "single": { "mode": "SIGN_MODE_DIRECT" } }, "sequence": "794129105682432" }], "fee": { "amount": [], "gas_limit": "8105066556817408", "payer": "", "granter": "" } }, "signatures": [""] }
            const expectedTxJSON = `{"body":{"messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","amount":[{"denom":"basetcro","amount":"1200050000000000"}],"from_address":"tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3","to_address":"tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3"}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[{"public_key":{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A/0NVgtsSqHKFnIdA5oZKGfDRX4Z2tVT7bmOe6iLFZwn"},"mode_info":{"single":{"mode":"SIGN_MODE_DIRECT"}},"sequence":"2"}],"fee":{"amount":[],"gas_limit":"200000","payer":"","granter":""}},"signatures":[""]}`;
            const anyTxJSONStr = anyTx.toCosmosJSON();
            expect(anyTxJSONStr).to.deep.equal(expectedTxJSON);

            expect(() => JSON.parse(anyTxJSONStr)).not.to.throw();

            expect(parsedCosmosJson).to.have.all.keys('body', 'auth_info', 'signatures');
            expect(parsedCosmosJson.body.messages.length).to.greaterThan(0);
            expect(parsedCosmosJson.body).to.haveOwnProperty('memo');
            expect(parsedCosmosJson.body).to.haveOwnProperty('timeout_height');
            expect(parsedCosmosJson.auth_info).to.haveOwnProperty('signer_infos');
            expect(parsedCosmosJson.auth_info).to.haveOwnProperty('fee');
            expect(parsedCosmosJson.auth_info.fee).to.haveOwnProperty('gas_limit');
            expect(parseInt(parsedCosmosJson.auth_info.fee.gas_limit, 10)).to.greaterThan(0);
        });
    });
});
