import 'mocha';
import { expect } from 'chai';

import Big from 'big.js';
import { fuzzyDescribe } from '../../../test/mocha-fuzzy/suite';
import { Units } from '../../../coin/coin';
import { CroSDK, CroNetwork } from '../../../core/cro';
import { HDKey } from '../../../hdkey/hdkey';
import { Secp256k1KeyPair } from '../../../keypair/secp256k1';
import { Network } from '../../../network/network';

const PystaportTestNet: Network = {
    defaultNodeUrl: '',
    chainId: 'chainmaind',
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
};
const cro = CroSDK({ network: PystaportTestNet });

describe('Testing MsgSubmitProposal and its content types', function () {
    const anyContent = new cro.gov.proposal.CommunityPoolSpendProposal({
        title: 'Make new cosmos version backward compatible with pre release',
        description: 'Lorem Ipsum ... A great proposal to increate backward compatibility and initial work on IBC',
        recipient: 'tcro1nhe3qasy0ayhje95mtsvppyg67d3zswf04sda8',
        amount: new cro.Coin('1200', Units.BASE),
    });

    fuzzyDescribe('should throw Error when MsgSubmitProposal options is invalid', function (fuzzy) {
        const anyValidProposalSubmission = {
            proposer: 'tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3',
            initialDeposit: new cro.Coin('1200', Units.BASE),
            content: anyContent,
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidProposalSubmission));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.gov.MsgSubmitProposal(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    fuzzyDescribe('should throw Error when CommunityPoolSpendProposal options is invalid', function (fuzzy) {
        const anyValidCommunityPoolSpendProposal = {
            title: 'Make new cosmos version backward compatible with pre release',
            description: 'Lorem Ipsum ... A great proposal to ...',
            recipient: 'tcro1nhe3qasy0ayhje95mtsvppyg67d3zswf04sda8',
            amount: new cro.Coin('1200', Units.BASE),
        };
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidCommunityPoolSpendProposal));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.gov.proposal.CommunityPoolSpendProposal(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    fuzzyDescribe('should throw Error when ParamChangeProposal options is invalid', function (fuzzy) {
        const anyValidParamChangeProposal = new cro.gov.proposal.ParamChangeProposal({
            title: 'Change a param to something more optimized',
            description: 'Lorem Ipsum ... The param should be changed to something more optimized',
            paramChanges: [
                {
                    subspace: 'staking',
                    key: 'MaxValidators',
                    value: '12',
                },
            ],
        });
        const testRunner = fuzzy(fuzzy.ObjArg(anyValidParamChangeProposal));

        testRunner(function (options) {
            if (options.valid) {
                return;
            }
            expect(() => new cro.gov.proposal.ParamChangeProposal(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test Signing MsgSubmitProposal of CommunityPoolSpendProposal Type', function () {
        const hdKey = HDKey.fromMnemonic(
            'guilt shield sting fluid wet east video business fold agree capital galaxy rapid almost melt piano taste guide spoil pull pigeon wood fit escape',
        );

        const privKey = hdKey.derivePrivKey("m/44'/1'/0'/0/0");
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const coin = new cro.Coin('120', Units.CRO);

        const communityPoolSpentContent = new cro.gov.proposal.CommunityPoolSpendProposal({
            title: 'Make new cosmos version backward compatible with pre release',
            description: 'Lorem Ipsum ... A great proposal to increate backward compatibility and initial work on IBC',
            recipient: 'tcro1nhe3qasy0ayhje95mtsvppyg67d3zswf04sda8',
            amount: coin,
        });

        const msgSubmitProposalCommunitySpend = new cro.gov.MsgSubmitProposal({
            proposer: 'tcro1nhe3qasy0ayhje95mtsvppyg67d3zswf04sda8',
            initialDeposit: coin,
            content: communityPoolSpentContent,
        });

        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(6),
            accountSequence: new Big(0),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(msgSubmitProposalCommunitySpend).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.getHexEncoded();
        expect(signedTx.getTxHash()).to.be.eq('2A177BC5B770C503096F5AA2CCF0B89EC8FC2D33C135630A38922266E6EE1EF1');
        expect(signedTxHex).to.be.eql(
            '0a93030a90030a252f636f736d6f732e676f762e763162657461312e4d73675375626d697450726f706f73616c12e6020a9d020a372f636f736d6f732e646973747269627574696f6e2e763162657461312e436f6d6d756e697479506f6f6c5370656e6450726f706f73616c12e1010a3c4d616b65206e657720636f736d6f732076657273696f6e206261636b7761726420636f6d70617469626c652077697468207072652072656c65617365125b4c6f72656d20497073756d202e2e2e20412067726561742070726f706f73616c20746f20696e637265617465206261636b7761726420636f6d7061746962696c69747920616e6420696e697469616c20776f726b206f6e204942431a2b7463726f316e68653371617379306179686a6539356d74737670707967363764337a73776630347364613822170a08626173657463726f120b313230303030303030303012170a08626173657463726f120b31323030303030303030301a2b7463726f316e68653371617379306179686a6539356d74737670707967363764337a73776630347364613812580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2102046b34d613be4ad7e79dcadf13fb4ce8d8d7ffeee7b554c32e924906d4e5664b12040a0208011800120410c09a0c1a4044e8f4777960420e4759bbe527ba18ad47bafff359d02c1eabb5fa14dd68a7c15373f5773810104d56a4fcb43033cb354b4c4c92c568be99ed1f06422f7d7d60',
        );
    });

    it('Test Signing MsgSubmitProposal of ParamChangeProposal Type', function () {
        const hdKey = HDKey.fromMnemonic(
            'order envelope snack half demand merry help obscure slogan like universe pond gain between brass settle pig float torch drama liberty grace check luxury',
        );

        const privKey = hdKey.derivePrivKey("m/44'/1'/0'/0/0");
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const coin = new cro.Coin('120', Units.CRO);

        const communityPoolSpentContent = new cro.gov.proposal.ParamChangeProposal({
            title: 'Change a param to something more optimized',
            description: 'Lorem Ipsum ... The param should be changed to something more optimized',
            paramChanges: [
                {
                    subspace: 'staking',
                    key: 'MaxValidators',
                    value: '12',
                },
            ],
        });

        const msgSubmitProposalChangeParam = new cro.gov.MsgSubmitProposal({
            proposer: 'tcro14sh490wk79dltea4udk95k7mw40wmvf77p0l5a',
            initialDeposit: coin,
            content: communityPoolSpentContent,
        });

        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(6),
            accountSequence: new Big(0),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(msgSubmitProposalChangeParam).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.getHexEncoded();
        expect(signedTx.getTxHash()).to.be.eq('AFEBA2DE9891AF22040359C8AACEF2836E8BF1276D66505DE36559F3E912EFF8');
        expect(signedTxHex).to.be.eql(
            '0abc020ab9020a252f636f736d6f732e676f762e763162657461312e4d73675375626d697450726f706f73616c128f020ac6010a2e2f636f736d6f732e706172616d732e763162657461312e506172616d657465724368616e676550726f706f73616c1293010a2a4368616e6765206120706172616d20746f20736f6d657468696e67206d6f7265206f7074696d697a656412474c6f72656d20497073756d202e2e2e2054686520706172616d2073686f756c64206265206368616e67656420746f20736f6d657468696e67206d6f7265206f7074696d697a65641a1c0a077374616b696e67120d4d617856616c696461746f72731a02313212170a08626173657463726f120b31323030303030303030301a2b7463726f31347368343930776b3739646c7465613475646b39356b376d773430776d7666373770306c356112580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a210280c5e37a2bc3e68cc7c4aac78eac8c769cf58ce269ecd4307427aa16c2ba05a412040a0208011800120410c09a0c1a4072bd47137d440036995ea6b5c4754b4f15609df2fdd17496d6c39f47d6663d0e51d171bcae92fc6078496cf657e2a705cd59b0d882cf0356463e57b26e285941',
        );
    });

    it('should throw on request legacy amino encoded transaction', function () {
        const communityPoolSpentContent = new cro.gov.proposal.ParamChangeProposal({
            title: 'Change a param to something more optimized',
            description: 'Lorem Ipsum ... The param should be changed to something more optimized',
            paramChanges: [
                {
                    subspace: 'staking',
                    key: 'MaxValidators',
                    value: '12',
                },
            ],
        });
        const msgSubmitProposalCommunitySpend = new cro.gov.MsgSubmitProposal({
            proposer: 'tcro1nhe3qasy0ayhje95mtsvppyg67d3zswf04sda8',
            initialDeposit: new cro.Coin('120', Units.CRO),
            content: communityPoolSpentContent,
        });

        expect(() => msgSubmitProposalCommunitySpend.toRawAminoMsg()).to.throw('Method not implemented.');
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a MsgSubmitProposal', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.gov.MsgSubmitProposal.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.gov.v1beta1.MsgSubmitProposal but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should return the MsgSubmitProposal corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.gov.v1beta1.MsgSubmitProposal","initial_deposit":[{"denom":"basetcro","amount":"12000000000"}],"content":{"@type":"/cosmos.params.v1beta1.ParameterChangeProposal","changes":[{"subspace":"staking","key":"MaxValidators","value":"12"}],"title":"Change a param to something more optimized","description":"Lorem Ipsum ... The param should be changed to something more optimized"},"proposer":"tcro14sh490wk79dltea4udk95k7mw40wmvf77p0l5a"}';
            const MsgDeposit = cro.gov.MsgSubmitProposal.fromCosmosMsgJSON(json, CroNetwork.Testnet);
            expect(MsgDeposit.initialDeposit.toCosmosCoins()[0].amount).to.eql('12000000000');
            expect(MsgDeposit.initialDeposit.toCosmosCoins()[0].denom).to.eql('basetcro');

            expect(MsgDeposit.proposer).to.eql('tcro14sh490wk79dltea4udk95k7mw40wmvf77p0l5a');

            expect(MsgDeposit.content.getEncoded().type_url).to.eql('/cosmos.params.v1beta1.ParameterChangeProposal');
        });
    });
});
