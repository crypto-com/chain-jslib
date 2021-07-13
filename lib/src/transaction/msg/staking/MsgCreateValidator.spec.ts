/* eslint-disable camelcase */
import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';
import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Bytes } from '../../../utils/bytes/bytes';
import { Units } from '../../../coin/coin';
import { CroSDK, CroNetwork } from '../../../core/cro';
import { protoEncodeEd25519PubKey } from './MsgCreateValidator';

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

describe('Testing MsgCreateValidator', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            description: {
                moniker: 'hiteshTest',
            },
            commission: {
                rate: '0.1',
                maxRate: '0.2',
                maxChangeRate: '0.01',
            },
            minSelfDelegation: '1',
            delegatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            pubkey: 'tcrocnclconspub1zcjduepqzp60e9aq8ek2zjedejhg0ncj00ncmcnqu37k09r5fmstlyfaakhsyqw3rc',
            value: new cro.Coin('1000', Units.BASE),
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.staking.MsgCreateValidator(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgCreateValidator conversion', function () {
        const coin = new cro.Coin('12000500', Units.BASE);

        const msgSend = new cro.staking.MsgCreateValidator({
            description: {
                moniker: 'hiteshTest',
                securityContact: 'hitesh.goel@crypto.com',
            },
            commission: {
                rate: '0.1',
                maxRate: '0.2',
                maxChangeRate: '0.01',
            },
            pubkey: 'ykxjs+cxozHiNuptXIHESIVKQcj1Dwgo7swOXs3HaTM=',
            minSelfDelegation: '1',
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            value: coin,
        });
        const rawMsg: Msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator',
            value: {
                description: {
                    moniker: 'hiteshTest',
                    securityContact: 'hitesh.goel@crypto.com',
                },
                commission: {
                    rate: '0.1',
                    maxRate: '0.2',
                    maxChangeRate: '0.01',
                },
                pubkey: protoEncodeEd25519PubKey(
                    Bytes.fromBase64String('ykxjs+cxozHiNuptXIHESIVKQcj1Dwgo7swOXs3HaTM='),
                ),
                minSelfDelegation: '1',
                delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                value: coin.toCosmosCoin(),
            },
        };

        expect(msgSend.toRawMsg()).to.eqls(rawMsg);
    });

    it('should accept MsgCreateValidator with optional fields ', function () {
        const coin = new cro.Coin('12000500', Units.BASE);
        const pubkey = protoEncodeEd25519PubKey(Bytes.fromBase64String('ykxjs+cxozHiNuptXIHESIVKQcj1Dwgo7swOXs3HaTM='));
        const msgSend = new cro.staking.MsgCreateValidator({
            description: {
                moniker: 'hiteshTest',
                securityContact: 'hitesh.goel@crypto.com',
            },
            commission: {
                rate: '0.1',
                maxRate: '0.2',
                maxChangeRate: '0.01',
            },
            pubkey: 'ykxjs+cxozHiNuptXIHESIVKQcj1Dwgo7swOXs3HaTM=',
            minSelfDelegation: '1',
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            value: coin,
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator',
            value: {
                description: {
                    moniker: 'hiteshTest',
                    securityContact: 'hitesh.goel@crypto.com',
                },
                commission: {
                    rate: '0.1',
                    maxRate: '0.2',
                    maxChangeRate: '0.01',
                },
                pubkey,
                minSelfDelegation: '1',
                delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
                validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
                value: coin.toCosmosCoin(),
            },
        };

        expect(msgSend.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgCreateValidator Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );
        const coin = new cro.Coin('12000500', Units.CRO);

        const msgCreateValidator = new cro.staking.MsgCreateValidator({
            description: {
                moniker: 'hiteshTest',
                identity: '',
                website: '',
                securityContact: 'hitesh.goel@crypto.com',
                details: '',
            },
            commission: {
                rate: '0.1',
                maxRate: '0.2',
                maxChangeRate: '0.01',
            },
            pubkey: 'ykxjs+cxozHiNuptXIHESIVKQcj1Dwgo7swOXs3HaTM=',
            minSelfDelegation: '1',
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
            value: coin,
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(msgCreateValidator).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const signedTxHex = signedTx.encode().toHexString();

        expect(signedTxHex).to.be.eql(
            '0ab4020ab1020a2a2f636f736d6f732e7374616b696e672e763162657461312e4d736743726561746556616c696461746f721282020a2a0a0a6869746573685465737412001a0022166869746573682e676f656c4063727970746f2e636f6d2a0012100a03302e311203302e321a04302e30311a0131222b7463726f313635747a63726832796c3833673871657178756567326735677a6775353779336665336b63332a2f7463726f636e636c316a3770656a386b706c656d347774353070346866766e64687577356a707278787874656e767232430a1d2f636f736d6f732e63727970746f2e656432353531392e5075624b657912220a20ca4c63b3e731a331e236ea6d5c81c448854a41c8f50f0828eecc0e5ecdc769333a1c0a08626173657463726f12103132303030353030303030303030303012580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a40f659741d05e997666313a98b545398937b6aa40d884f1f2bf5aed8a281b5118d1123d11e98db388a6cf303a2c41341b6602b685d967aebf4b74af67d767dbd45',
        );
    });

    it('Should validate MsgCreateValidator provided addresses with network config', function () {
        const coin = new cro.Coin('12000500', Units.BASE);
        const params3 = {
            description: {
                moniker: 'hiteshTest',
                identity: '',
                website: '',
                securityContact: 'hitesh.goel@crypto.com',
                details: '',
            },
            commission: {
                rate: '0.100000000000000000',
                maxRate: '0.200000000000000000',
                maxChangeRate: '0.010000000000000000',
            },
            pubkey: 'ykxjs+cxozHiNuptXIHESIVKQcj1Dwgo7swOXs3HaTM=',
            minSelfDelegation: '1',
            delegatorAddress: 'tcro165tzcrh2yl83g8qeqxueg2g5gzgu57y3fe3kc3',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenr',
            value: coin,
        };
        expect(() => new cro.staking.MsgCreateValidator(params3)).to.throw(
            'Invalid checksum for tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenr',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgCreateValidator', function () {
            const json =
                '{ "@type": "/cosmos.staking.v1beta1.MsgEditValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.staking.v1beta1.MsgCreateValidator but got /cosmos.staking.v1beta1.MsgEditValidator',
            );
        });

        it('should throw Error when the `delegator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"min_self_delegation":"1","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="},"value":{"denom":"basetcro","amount":"50000000000000"}}';

            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `delegatorAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });

        it('should throw Error when the `minSelfDelegation` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="},"value":{"denom":"basetcro","amount":"50000000000000"}}';

            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `minSelfDelegation` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `validator_address` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"min_self_delegation":"1","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="},"value":{"denom":"basetcro","amount":"50000000000000"}}';

            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected property `validatorAddress` to be of type `string` but received type `undefined` in object `options`',
            );
        });
        it('should throw Error when the `value` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"min_self_delegation":"1","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="}}';
            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid value in the Msg.',
            );
        });

        it('should throw Error when the `pubkey` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"min_self_delegation":"1","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","value":{"denom":"basetcro","amount":"50000000000000"}}';
            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid pubkey in the Msg.',
            );
        });
        it('should throw Error when the `commission` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"min_self_delegation":"1","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="},"value":{"denom":"basetcro","amount":"50000000000000"}}';
            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid commission in the Msg.',
            );
        });
        it('should throw Error when the `description` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"min_self_delegation":"1","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="},"value":{"denom":"basetcro","amount":"50000000000000"}}';
            expect(() => cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Invalid description in the Msg.',
            );
        });

        it('should return the MsgCreateValidator corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"commission":{"rate":"0.100000000000000000","max_rate":"0.200000000000000000","max_change_rate":"0.010000000000000000"},"min_self_delegation":"1","delegator_address":"tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q","validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"EHT8l6A+bKFLLcyuh88Se+eN4mDkfWeUdE7gv5E97a8="},"value":{"denom":"basetcro","amount":"50000000000000"}}';

            const MsgCreateValidator = cro.staking.MsgCreateValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgCreateValidator.validatorAddress).to.eql('tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr');
            expect(MsgCreateValidator.delegatorAddress).to.eql('tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q');
            expect(MsgCreateValidator.minSelfDelegation).to.eql('1');

            expect(MsgCreateValidator.value.toCosmosCoin().amount).to.eql('50000000000000');
            expect(MsgCreateValidator.value.toCosmosCoin().denom).to.eql('basetcro');

            expect(MsgCreateValidator.commission.rate).to.eql('0.100000000000000000');
            expect(MsgCreateValidator.commission.maxRate).to.eql('0.200000000000000000');
            expect(MsgCreateValidator.commission.maxChangeRate).to.eql('0.010000000000000000');

            expect(MsgCreateValidator.description.securityContact).to.eql('hitesh.goel@crypto.com');
            expect(MsgCreateValidator.description.moniker).to.eql('hiteshTest');
        });
    });
});
