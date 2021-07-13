import 'mocha';
import { expect } from 'chai';

import Big from 'big.js';
import { Network } from '../../../../network/network';
import { CroSDK, CroNetwork } from '../../../../core/cro';
import { Units } from '../../../../coin/coin';
import { fuzzyDescribe } from '../../../../test/mocha-fuzzy/suite';
import { HDKey } from '../../../../hdkey/hdkey';
import { Secp256k1KeyPair } from '../../../../keypair/secp256k1';

const PystaportTestNet: Network = {
    rpcUrl: '',
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
};
const cro = CroSDK({ network: PystaportTestNet });

describe('Testing TextProposal and its content types', function () {
    const anyContent = new cro.gov.proposal.TextProposal({
        title: 'Make new cosmos version backward compatible with pre release',
        description: 'Lorem Ipsum ...',
    });

    fuzzyDescribe('should throw Error when TextProposal options is invalid', function (fuzzy) {
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
            expect(() => new cro.gov.proposal.TextProposal(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test Signing TextProposal Type', function () {
        const hdKey = HDKey.fromMnemonic(
            'order envelope snack half demand merry help obscure slogan like universe pond gain between brass settle pig float torch drama liberty grace check luxury',
        );

        const privKey = hdKey.derivePrivKey("m/44'/1'/0'/0/0");
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const coin = new cro.Coin('120', Units.CRO);

        const textProposalContent = new cro.gov.proposal.TextProposal({
            title: 'Text Proposal Title',
            description: 'Lorem Ipsum ... Checking cancel software upgrade',
        });

        const TextProposalChangeParam = new cro.gov.MsgSubmitProposal({
            proposer: 'tcro14sh490wk79dltea4udk95k7mw40wmvf77p0l5a',
            initialDeposit: coin,
            content: textProposalContent,
        });

        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(6),
            accountSequence: new Big(0),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx.appendMessage(TextProposalChangeParam).addSigner(anySigner).toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.getHexEncoded();
        expect(signedTx.getTxHash()).to.be.eq('2F22027A01B9547C1073E8F0032AD8316B86EE0FB52AF9517634D5697C919ED4');
        expect(signedTxHex).to.be.eql(
            '0ae0010add010a252f636f736d6f732e676f762e763162657461312e4d73675375626d697450726f706f73616c12b3010a6b0a202f636f736d6f732e676f762e763162657461312e5465787450726f706f73616c12470a13546578742050726f706f73616c205469746c6512304c6f72656d20497073756d202e2e2e20436865636b696e672063616e63656c20736f667477617265207570677261646512170a08626173657463726f120b31323030303030303030301a2b7463726f31347368343930776b3739646c7465613475646b39356b376d773430776d7666373770306c356112580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a210280c5e37a2bc3e68cc7c4aac78eac8c769cf58ce269ecd4307427aa16c2ba05a412040a0208011800120410c09a0c1a40e3fe5009273f539d4f6e37b55136ce776855e45da95800a1e23e8fffd83dc3f96874f6d3ec116a19b9b6e2e19031f11ae533e0de26edec1eccca57fd6f1e0bef',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a TextProposal', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() => cro.gov.proposal.TextProposal.fromCosmosMsgJSON(json, CroNetwork.Testnet)).to.throw(
                'Expected /cosmos.gov.v1beta1.TextProposal but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should return the TextProposal corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.gov.v1beta1.TextProposal","title": "Text Proposal Title", "description": "Lorem Ipsum ... Checking text proposal"}';
            const TextProposal = cro.gov.proposal.TextProposal.fromCosmosMsgJSON(json, CroNetwork.Testnet);

            expect(TextProposal.title).to.eql('Text Proposal Title');

            expect(TextProposal.description).to.eql('Lorem Ipsum ... Checking text proposal');
        });
    });
});
