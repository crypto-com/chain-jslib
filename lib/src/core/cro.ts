import ow from 'ow';

import { croClient } from '../client/client';
import { Network } from '../network/network';
import { coin } from '../coin/coin';
import { owCroSDKInitParams } from './ow.types';
import { rawTransaction } from '../transaction/raw';
import { msgSend } from '../transaction/msg/bank/msgsend';
import { msgCreateValidator } from '../transaction/msg/staking/MsgCreateValidator';
import { msgWithdrawDelegateReward } from '../transaction/msg/distribution/MsgWithdrawDelegatorReward';
import { msgDelegate } from '../transaction/msg/staking/MsgDelegate';
import { msgEditValidator } from '../transaction/msg/staking/MsgEditValidator';
import { msgUndelegate } from '../transaction/msg/staking/MsgUndelegate';
import { msgBeginRedelegate } from '../transaction/msg/staking/MsgBeginRedelegate';
import { userAddress } from '../address/address';
import { msgWithdrawValidatorCommission } from '../transaction/msg/distribution/MsgWithdrawValidatorCommission';
import { msgDeposit } from '../transaction/msg/gov/MsgDeposit';
import { msgVote } from '../transaction/msg/gov/MsgVote';
import { msgSubmitProposal } from '../transaction/msg/gov/MsgSubmitProposal';
import { communityPoolSpendProposal } from '../transaction/msg/gov/proposal/CommunityPoolSpendProposal';
import { paramChangeProposal } from '../transaction/msg/gov/proposal/ParamChangeProposal';
import { cancelSoftwareUpgradeProposal } from '../transaction/msg/gov/proposal/CancelSoftwareUpgradeProposal';
import { softwareUpgradeProposal } from '../transaction/msg/gov/proposal/SoftwareUpgradeProposal';
import { msgSetWithdrawAddress } from '../transaction/msg/distribution/MsgSetWithdrawAddress';
import { msgFundCommunityPool } from '../transaction/msg/distribution/MsgFundCommunityPool';
import { textProposal } from '../transaction/msg/gov/proposal/TextProposal';
import { msgIssueDenomNFT } from '../transaction/msg/nft/MsgIssueDenom';
import { msgMintNFT } from '../transaction/msg/nft/MsgMintNFT';
import { msgEditNFT } from '../transaction/msg/nft/MsgEditNFT';
import { msgTransferNFT } from '../transaction/msg/nft/MsgTransferNFT';
import { msgBurnNFT } from '../transaction/msg/nft/MsgBurnNFT';
import { msgTransferIBC } from '../transaction/msg/ibc/applications/MsgTransfer';
import { msgCreateClientIBC } from '../transaction/msg/ibc/core/MsgCreateClient';
import { msgSendV2 } from '../transaction/msg/v2/bank/v2.msgsend';
import { msgFundCommunityPoolV2 } from '../transaction/msg/v2/distribution/v2.MsgFundCommunityPool';
import { msgDepositV2 } from '../transaction/msg/v2/gov/v2.MsgDeposit';
import { communityPoolSpendProposalV2 } from '../transaction/msg/v2/gov/proposal/v2.CommunityPoolSpendProposal';
import { msgSubmitProposalV2 } from '../transaction/msg/v2/gov/v2.MsgSubmitProposal';
import { msgUpdateClientIBC } from '../transaction/msg/ibc/core/MsgUpdateClient';
import { msgUpgradeClientIBC } from '../transaction/msg/ibc/core/MsgUpgradeClient';
import { msgSubmitMisbehaviourIBC } from '../transaction/msg/ibc/core/MsgSubmitMisbehaviour';

export const CroSDK = function (configs: InitConfigurations) {
    ow(configs, 'configs', owCroSDKInitParams);

    return {
        CroClient: croClient(configs),
        Coin: coin(configs),
        RawTransaction: rawTransaction(configs),
        Address: userAddress(configs),
        gov: {
            MsgDeposit: msgDeposit(configs),
            MsgVote: msgVote(configs),
            MsgSubmitProposal: msgSubmitProposal(configs),
            proposal: {
                CommunityPoolSpendProposal: communityPoolSpendProposal(configs),
                ParamChangeProposal: paramChangeProposal(),
                CancelSoftwareUpgradeProposal: cancelSoftwareUpgradeProposal(),
                SoftwareUpgradeProposal: softwareUpgradeProposal(),
                TextProposal: textProposal(),
            },
        },
        bank: {
            MsgSend: msgSend(configs),
        },
        staking: {
            MsgCreateValidator: msgCreateValidator(configs),
            MsgEditValidator: msgEditValidator(configs),
            MsgDelegate: msgDelegate(configs),
            MsgUndelegate: msgUndelegate(configs),
            MsgBeginRedelegate: msgBeginRedelegate(configs),
        },
        distribution: {
            MsgWithdrawValidatorCommission: msgWithdrawValidatorCommission(configs),
            MsgWithdrawDelegatorReward: msgWithdrawDelegateReward(configs),
            MsgSetWithdrawAddress: msgSetWithdrawAddress(configs),
            MsgFundCommunityPool: msgFundCommunityPool(configs),
        },
        nft: {
            MsgIssueDenom: msgIssueDenomNFT(configs),
            MsgMintNFT: msgMintNFT(configs),
            MsgEditNFT: msgEditNFT(configs),
            MsgTransferNFT: msgTransferNFT(configs),
            MsgBurnNFT: msgBurnNFT(configs),
        },
        ibc: {
            MsgTransfer: msgTransferIBC(configs),
            MsgCreateClient: msgCreateClientIBC(configs),
            MsgUpdateClient: msgUpdateClientIBC(configs),
            MsgUpgradeClient: msgUpgradeClientIBC(configs),
            MsgSubmitMisbehaviour: msgSubmitMisbehaviourIBC(configs),
        },
        v2: {
            bank: {
                MsgSendV2: msgSendV2(configs),
            },
            distribution: {
                MsgFundCommunityPoolV2: msgFundCommunityPoolV2(configs),
            },
            gov: {
                MsgDepositV2: msgDepositV2(configs),
                MsgSubmitProposalV2: msgSubmitProposalV2(configs),
                proposal: {
                    CommunityPoolSpendProposalV2: communityPoolSpendProposalV2(configs),
                },
            },
        },
        Options: configs,
    };
};

export class CroNetwork {
    public static Mainnet: Network = {
        defaultNodeUrl: 'https://mainnet.crypto.org',
        chainId: 'crypto-org-chain-mainnet-1',
        addressPrefix: 'cro',
        validatorAddressPrefix: 'crocncl',
        validatorPubKeyPrefix: 'crocnclconspub',
        coin: {
            baseDenom: 'basecro',
            croDenom: 'cro',
        },
        bip44Path: {
            coinType: 394,
            account: 0,
        },
        rpcUrl: 'https://mainnet.crypto.org:26657',
    };

    public static Testnet: Network = {
        defaultNodeUrl: 'https://testnet-croeseid.crypto.org',
        chainId: 'testnet-croeseid-2',
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
        rpcUrl: 'https://testnet-croeseid.crypto.org:26657',
    };

    public static TestnetCroeseid3: Network = {
        defaultNodeUrl: 'https://testnet-croeseid-3.crypto.org',
        chainId: 'testnet-croeseid-3',
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
        rpcUrl: 'https://testnet-croeseid-3.crypto.org:26657',
    };
}

export type InitConfigurations = {
    network: Network;
    // More sdk configs to be added in the future
};
