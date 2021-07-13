import 'mocha';
import { expect } from 'chai';
import Big from 'big.js';
import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Bytes } from '../../../utils/bytes/bytes';
import { CroSDK, CroNetwork } from '../../../core/cro';

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

describe('Testing MsgEditValidator', function () {
    fuzzyDescribe('should throw Error when options is invalid', function (fuzzy) {
        const anyValidOptions = {
            description: {
                moniker: 'moniker',
                identity: 'identity',
                website: 'website.com',
                security_contact: 'security@contact.com',
                details: 'HiteshTest',
            },
            validator_address: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            commission_rate: '0.100000000000000000',
            min_self_delegation: '2',
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidOptions));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.staking.MsgEditValidator(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test MsgEditValidator conversion', function () {
        const msgSend = new cro.staking.MsgEditValidator({
            description: {
                moniker: 'moniker',
                identity: 'identity',
                website: 'website.com',
                securityContact: 'security@contact.com',
                details: 'HiteshTest',
            },
            validatorAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            commissionRate: '0.100000000000000000',
            minSelfDelegation: '2',
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator',
            value: {
                description: {
                    moniker: 'moniker',
                    identity: 'identity',
                    website: 'website.com',
                    securityContact: 'security@contact.com',
                    details: 'HiteshTest',
                },
                validatorAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
                commissionRate: '0.100000000000000000',
                minSelfDelegation: '2',
            },
        };

        expect(msgSend.toRawMsg()).to.eqls(rawMsg);
    });

    it('should pass MsgEditValidator has no description fields', function () {
        const msgSend = new cro.staking.MsgEditValidator({
            description: {},
            validatorAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
            commissionRate: '0.100000000000000000',
            minSelfDelegation: '2',
        });

        const rawMsg: Msg = {
            typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator',
            value: {
                description: {},
                validatorAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3wx',
                commissionRate: '0.100000000000000000',
                minSelfDelegation: '2',
            },
        };

        expect(msgSend.toRawMsg()).to.eqls(rawMsg);
    });

    it('Test appendTxBody MsgEditValidator Tx signing', function () {
        const anyKeyPair = Secp256k1KeyPair.fromPrivKey(
            Bytes.fromHexString('66633d18513bec30dd11a209f1ceb1787aa9e2069d5d47e590174dc9665102b3'),
        );

        const MsgEditValidator = new cro.staking.MsgEditValidator({
            description: {
                moniker: 'hiteshTest',
                identity: '',
                website: '',
                securityContact: 'hitesh.goel@crypto.com',
                details: '',
            },
            commissionRate: '0.100000000000000000',
            minSelfDelegation: '1.0',
            validatorAddress: 'tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr',
        });

        const anySigner = {
            publicKey: anyKeyPair.getPubKey(),
            accountNumber: new Big(0),
            accountSequence: new Big(2),
        };

        const rawTx = new cro.RawTransaction();
        const signableTx = rawTx.appendMessage(MsgEditValidator).addSigner(anySigner).toSignable();
        const signedTx = signableTx.setSignature(0, anyKeyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();
        const signedTxHex = signedTx.encode().toHexString();
        expect(signedTxHex).to.be.eql(
            '0aa7010aa4010a282f636f736d6f732e7374616b696e672e763162657461312e4d73674564697456616c696461746f7212780a2a0a0a6869746573685465737412001a0022166869746573682e676f656c4063727970746f2e636f6d2a00122f7463726f636e636c316a3770656a386b706c656d347774353070346866766e64687577356a707278787874656e76721a14302e3130303030303030303030303030303030302203312e3012580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103fd0d560b6c4aa1ca16721d039a192867c3457e19dad553edb98e7ba88b159c2712040a0208011802120410c09a0c1a4087e81b3b9706a35520778ed9099560c86b3ce8aaec3b384cc9720c89d3e044ab2601240a0d83f6a2e683e370c828b27dca8117de53eea269065c034e45e820f3',
        );
    });

    it('Should validate MsgEditValidator provided addresses with network config', function () {
        const params1 = {
            description: {
                moniker: 'moniker',
                identity: 'identity',
                website: 'website.com',
                securityContact: 'security@contact.com',
                details: 'HiteshTest',
            },
            validatorAddress: 'tcro1j7pej8kplem4wt50p4hfvndhuw5jprxxn5625q',
            commissionRate: '0.100000000000000000',
            minSelfDelegation: '2',
        };

        const params2 = {
            description: {
                moniker: 'moniker',
                identity: 'identity',
                website: 'website.com',
                securityContact: 'security@contact.com',
                details: 'HiteshTest',
            },
            validatorAddress: 'tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3w',
            commissionRate: '0.100000000000000000',
            minSelfDelegation: '2',
        };

        expect(() => new cro.staking.MsgEditValidator(params1)).to.throw(
            'Provided `validatorAddress` doesnt match network selected',
        );
        expect(() => new cro.staking.MsgEditValidator(params2)).to.throw(
            'Invalid checksum for tcrocncl16mmzexp3zqfpgqtnn927m5ph560qgxrs52a3w',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgEditValidator', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.staking.MsgEditValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.staking.v1beta1.MsgEditValidator but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should NOT throw Error when the `commission_rate` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgEditValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","min_self_delegation":"1"}';
            expect(() => cro.staking.MsgEditValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.not.throw(
                'Expected `commissionRate` to be of type `null` but received type `undefined` in object `options`',
            );
            const msgEdit = cro.staking.MsgEditValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(msgEdit.commissionRate).to.be.null;
        });
        it('should NOT throw Error when the `min_self_delegation` field is missing', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgEditValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","commission_rate":"0.100000000000000000"}';
            expect(() => cro.staking.MsgEditValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.not.throw(
                'Expected `minSelfDelegation` to be of type `null` but received type `undefined` in object `options`',
            );
            const msgEdit = cro.staking.MsgEditValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(msgEdit.minSelfDelegation).to.be.null;
        });

        it('should return the MsgEditValidator corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.staking.v1beta1.MsgEditValidator","description":{"moniker":"hiteshTest","identity":"","website":"","security_contact":"hitesh.goel@crypto.com","details":""},"validator_address":"tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr","commission_rate":"0.100000000000000000","min_self_delegation":"1"}';
            const MsgEditValidator = cro.staking.MsgEditValidator.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgEditValidator.validatorAddress).to.eql('tcrocncl1j7pej8kplem4wt50p4hfvndhuw5jprxxxtenvr');
            expect(MsgEditValidator.minSelfDelegation).to.eql('1');
            expect(MsgEditValidator.commissionRate).to.eql('0.100000000000000000');
            expect(MsgEditValidator.description.securityContact).to.eql('hitesh.goel@crypto.com');
            expect(MsgEditValidator.description.moniker).to.eql('hiteshTest');
        });
    });
});
