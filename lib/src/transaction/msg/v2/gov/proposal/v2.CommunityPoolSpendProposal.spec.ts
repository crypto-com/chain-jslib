import 'mocha';
import { expect } from 'chai';

import Big from 'big.js';
import { Network } from '../../../../../network/network';
import { CroSDK, CroNetwork } from '../../../../../core/cro';
import { fuzzyDescribe } from '../../../../../test/mocha-fuzzy/suite';
import { Units } from '../../../../../coin/coin';
import { HDKey } from '../../../../../hdkey/hdkey';
import { Secp256k1KeyPair } from '../../../../../keypair/secp256k1';

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
const coin = cro.Coin.fromBaseUnit('10000');

describe('Testing CommunityPoolSpendProposalV2 and its content types', function () {
    const anyContent = new cro.v2.gov.proposal.CommunityPoolSpendProposalV2({
        title: 'Make new cosmos version backward compatible with pre release',
        description: 'Lorem Ipsum ...',
        recipient: 'tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg',
        amount: [coin],
    });

    fuzzyDescribe('should throw Error when CommunityPoolSpendProposalV2 options is invalid', function (fuzzy) {
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
            expect(() => new cro.v2.gov.proposal.CommunityPoolSpendProposalV2(options.value)).to.throw(
                'Expected `options` to be of type `object`',
            );
        });
    });

    it('Test Signing CommunityPoolSpendProposalV2 Type', function () {
        const hdKey = HDKey.fromMnemonic(
            'order envelope snack half demand merry help obscure slogan like universe pond gain between brass settle pig float torch drama liberty grace check luxury',
        );

        const privKey = hdKey.derivePrivKey("m/44'/1'/0'/0/0");
        const keyPair = Secp256k1KeyPair.fromPrivKey(privKey);

        const CommunityPoolSpendProposalV2Content = new cro.v2.gov.proposal.CommunityPoolSpendProposalV2({
            title: 'Text Proposal Title',
            description: 'Lorem Ipsum ... Checking cancel software upgrade',
            recipient: 'tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg',
            amount: [coin],
        });

        const CommunityPoolSpendProposalV2ChangeParam = new cro.gov.MsgSubmitProposal({
            proposer: 'tcro14sh490wk79dltea4udk95k7mw40wmvf77p0l5a',
            initialDeposit: coin,
            content: CommunityPoolSpendProposalV2Content,
        });

        const anySigner = {
            publicKey: keyPair.getPubKey(),
            accountNumber: new Big(6),
            accountSequence: new Big(0),
        };

        const rawTx = new cro.RawTransaction();

        const signableTx = rawTx
            .appendMessage(CommunityPoolSpendProposalV2ChangeParam)
            .addSigner(anySigner)
            .toSignable();

        const signedTx = signableTx.setSignature(0, keyPair.sign(signableTx.toSignDocumentHash(0))).toSigned();

        const signedTxHex = signedTx.getHexEncoded();
        expect(signedTx.getTxHash()).to.be.eq('B68228C66AC221329AD61AB8924327F9062F80B9230C4947CBD5105A63896F99');
        expect(signedTxHex).to.be.eql(
            '0ab3020ab0020a252f636f736d6f732e676f762e763162657461312e4d73675375626d697450726f706f73616c1286020ac3010a372f636f736d6f732e646973747269627574696f6e2e763162657461312e436f6d6d756e697479506f6f6c5370656e6450726f706f73616c1287010a13546578742050726f706f73616c205469746c6512304c6f72656d20497073756d202e2e2e20436865636b696e672063616e63656c20736f66747761726520757067726164651a2b7463726f317830376b6b6b6570666a32686c3865746c63757168656a376a6a366d7971727034387934686722110a08626173657463726f1205313030303012110a08626173657463726f120531303030301a2b7463726f31347368343930776b3739646c7465613475646b39356b376d773430776d7666373770306c356112580a500a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a210280c5e37a2bc3e68cc7c4aac78eac8c769cf58ce269ecd4307427aa16c2ba05a412040a0208011800120410c09a0c1a403ad1334095809e6daa04a1a3583703fd7ef651a97e8518450fe9c893f26296e462cd6734306c4d374a1fabf2e0387bf987c4440010507789c57ef5ae320f659a',
        );
    });
    describe('fromCosmosJSON', function () {
        it('should throw Error if the JSON is not a CommunityPoolSpendProposalV2', function () {
            const json =
                '{ "@type": "/cosmos.bank.v1beta1.MsgCreateValidator", "amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "from_address": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg", "to_address": "tcro184lta2lsyu47vwyp2e8zmtca3k5yq85p6c4vp3" }';
            expect(() =>
                cro.v2.gov.proposal.CommunityPoolSpendProposalV2.fromCosmosMsgJSON(json, CroNetwork.Testnet),
            ).to.throw(
                'Expected /cosmos.distribution.v1beta1.CommunityPoolSpendProposal but got /cosmos.bank.v1beta1.MsgCreateValidator',
            );
        });

        it('should return the CommunityPoolSpendProposalV2 corresponding to the JSON', function () {
            const json =
                '{"@type":"/cosmos.distribution.v1beta1.CommunityPoolSpendProposal","title": "Text Proposal Title", "description": "Lorem Ipsum ... Checking text proposal","amount": [{ "denom": "basetcro", "amount": "3478499933290496" }], "recipient": "tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg"}';
            const CommunityPoolSpendProposalV2 = cro.v2.gov.proposal.CommunityPoolSpendProposalV2.fromCosmosMsgJSON(
                json,
                CroNetwork.Testnet,
            );

            expect(CommunityPoolSpendProposalV2.title).to.eql('Text Proposal Title');

            expect(CommunityPoolSpendProposalV2.description).to.eql('Lorem Ipsum ... Checking text proposal');
            expect(CommunityPoolSpendProposalV2.recipient).to.eql('tcro1x07kkkepfj2hl8etlcuqhej7jj6myqrp48y4hg');
        });
    });
});
