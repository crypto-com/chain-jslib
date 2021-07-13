export const COSMOS_MSG_TYPEURL = {
    MsgBeginRedelegate: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
    Coin: '/cosmos.base.v1beta1.Coin',
    MsgSend: '/cosmos.bank.v1beta1.MsgSend',
    MsgWithdrawDelegatorReward: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    MsgCreateValidator: '/cosmos.staking.v1beta1.MsgCreateValidator',
    MsgEditValidator: '/cosmos.staking.v1beta1.MsgEditValidator',
    MsgDelegate: '/cosmos.staking.v1beta1.MsgDelegate',
    MsgUndelegate: '/cosmos.staking.v1beta1.MsgUndelegate',
    MsgWithdrawValidatorCommission: '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
    MsgDeposit: '/cosmos.gov.v1beta1.MsgDeposit',
    MsgVote: '/cosmos.gov.v1beta1.MsgVote',
    MsgSubmitProposal: '/cosmos.gov.v1beta1.MsgSubmitProposal',
    PubKey: {
        ed25519: '/cosmos.crypto.ed25519.PubKey',
    },
    upgrade: {
        CancelSoftwareUpgradeProposal: '/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal',
        SoftwareUpgradeProposal: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
        ParameterChangeProposal: '/cosmos.params.v1beta1.ParameterChangeProposal',
        CommunityPoolSpendProposal: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
    },
    distribution: {
        MsgSetWithdrawAddress: '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
        MsgFundCommunityPool: '/cosmos.distribution.v1beta1.MsgFundCommunityPool',
    },
    gov: {
        TextProposal: '/cosmos.gov.v1beta1.TextProposal',
    },
    nft: {
        MsgIssueDenom: '/chainmain.nft.v1.MsgIssueDenom',
        MsgMintNFT: '/chainmain.nft.v1.MsgMintNFT',
        MsgEditNFT: '/chainmain.nft.v1.MsgEditNFT',
        MsgTransferNFT: '/chainmain.nft.v1.MsgTransferNFT',
        MsgBurnNFT: '/chainmain.nft.v1.MsgBurnNFT',
    },
    ibc: {
        MsgTransfer: '/ibc.applications.transfer.v1.MsgTransfer',
        MsgCreateClient: '/ibc.core.client.v1.MsgCreateClient',
        MsgUpdateClient: '/ibc.core.client.v1.MsgUpdateClient',
        MsgUpgradeClient: '/ibc.core.client.v1.MsgUpgradeClient',
        MsgSubmitMisbehaviour: '/ibc.core.client.v1.MsgSubmitMisbehaviour',
    },
};

export const typeUrlToMsgClassMapping = (cro: any, typeUrl: string) => {
    switch (typeUrl) {
        // bank
        case COSMOS_MSG_TYPEURL.MsgSend:
            return cro.bank.MsgSend;

        // distribution
        case COSMOS_MSG_TYPEURL.distribution.MsgFundCommunityPool:
            return cro.distribution.MsgFundCommunityPool;
        case COSMOS_MSG_TYPEURL.distribution.MsgSetWithdrawAddress:
            return cro.distribution.MsgSetWithdrawAddress;
        case COSMOS_MSG_TYPEURL.MsgWithdrawDelegatorReward:
            return cro.distribution.MsgWithdrawDelegatorReward;
        case COSMOS_MSG_TYPEURL.MsgWithdrawValidatorCommission:
            return cro.distribution.MsgWithdrawValidatorCommission;

        // staking
        case COSMOS_MSG_TYPEURL.MsgBeginRedelegate:
            return cro.staking.MsgBeginRedelegate;
        case COSMOS_MSG_TYPEURL.MsgCreateValidator:
            return cro.staking.MsgCreateValidator;
        case COSMOS_MSG_TYPEURL.MsgDelegate:
            return cro.staking.MsgDelegate;
        case COSMOS_MSG_TYPEURL.MsgEditValidator:
            return cro.staking.MsgEditValidator;
        case COSMOS_MSG_TYPEURL.MsgUndelegate:
            return cro.staking.MsgUndelegate;

        // governance
        case COSMOS_MSG_TYPEURL.MsgDeposit:
            return cro.gov.MsgDeposit;
        case COSMOS_MSG_TYPEURL.MsgVote:
            return cro.gov.MsgVote;
        case COSMOS_MSG_TYPEURL.MsgSubmitProposal:
            return cro.gov.MsgSubmitProposal;

        // proposal
        case COSMOS_MSG_TYPEURL.gov.TextProposal:
            return cro.gov.proposal.TextProposal;
        case COSMOS_MSG_TYPEURL.upgrade.CancelSoftwareUpgradeProposal:
            return cro.gov.proposal.CancelSoftwareUpgradeProposal;
        case COSMOS_MSG_TYPEURL.upgrade.CommunityPoolSpendProposal:
            return cro.gov.proposal.CommunityPoolSpendProposal;
        case COSMOS_MSG_TYPEURL.upgrade.ParameterChangeProposal:
            return cro.gov.proposal.ParamChangeProposal;
        case COSMOS_MSG_TYPEURL.upgrade.SoftwareUpgradeProposal:
            return cro.gov.proposal.SoftwareUpgradeProposal;

        // ibc
        case COSMOS_MSG_TYPEURL.ibc.MsgTransfer:
            return cro.ibc.MsgTransfer;
        case COSMOS_MSG_TYPEURL.ibc.MsgCreateClient:
            return cro.ibc.MsgCreateClient;
        case COSMOS_MSG_TYPEURL.ibc.MsgUpdateClient:
            return cro.ibc.MsgUpdateClient;
        case COSMOS_MSG_TYPEURL.ibc.MsgUpgradeClient:
            return cro.ibc.MsgUpgradeClient;
        case COSMOS_MSG_TYPEURL.ibc.MsgSubmitMisbehaviour:
            return cro.ibc.MsgSubmitMisbehaviour;

        // nft
        case COSMOS_MSG_TYPEURL.nft.MsgIssueDenom:
            return cro.nft.MsgIssueDenom;
        case COSMOS_MSG_TYPEURL.nft.MsgMintNFT:
            return cro.nft.MsgMintNFT;
        case COSMOS_MSG_TYPEURL.nft.MsgEditNFT:
            return cro.nft.MsgEditNFT;
        case COSMOS_MSG_TYPEURL.nft.MsgTransferNFT:
            return cro.nft.MsgTransferNFT;
        case COSMOS_MSG_TYPEURL.nft.MsgBurnNFT:
            return cro.nft.MsgBurnNFT;

        default:
            throw new Error(`${typeUrl} not supported.`);
    }
};
