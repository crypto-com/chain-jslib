import ow from 'ow';
import { owCoin, owOptionalCoin } from '../../coin/ow.types';
import { owBig, owStrictObject, owOptionalStrictObject } from '../../ow.types';
import { VoteOption } from './gov/MsgVote';
import { isMsgProposalContent } from './gov/IMsgProposalContent';
import { owLong } from './gov/ow.types';

const voteOptionValidator = (val: number) => ({
    validator: Object.values(VoteOption).includes(val as any),
    message: (label: string) => `Expected ${label} to be one of the Vote options, got \`${val}\``,
});

const proposalContentValidatorFn = (val: object) => ({
    validator: isMsgProposalContent(val),
    message: (label: string) => `Expected ${label} to be an instance of \`IMsgProposalContent\`, got \`${val}\``,
});

const owContent = () => owStrictObject().validate(proposalContentValidatorFn);

export const owVoteOption = () => ow.number.validate(voteOptionValidator);

export const owMsgSendOptions = owStrictObject().exactShape({
    fromAddress: ow.string,
    toAddress: ow.string,
    amount: owCoin(),
});
export const v2 = {
    owMsgSendOptions: owStrictObject().exactShape({
        fromAddress: ow.string,
        toAddress: ow.string,
        amount: ow.array.ofType(owCoin()),
    }),
    owMsgFundCommunityPoolOptions: owStrictObject().exactShape({
        depositor: ow.string,
        amount: ow.array.ofType(owCoin()),
    }),
    owMsgDepositOptions: owStrictObject().exactShape({
        depositor: ow.string,
        proposalId: owBig(),
        amount: ow.array.ofType(owCoin()),
    }),
    owCommunityPoolSpendProposalOptions: owStrictObject().exactShape({
        title: ow.string,
        description: ow.string,
        recipient: ow.string,
        amount: ow.array.ofType(owCoin()),
    }),
    owMsgSubmitProposalOptions: owStrictObject().exactShape({
        proposer: ow.string,
        initialDeposit: ow.array.ofType(owCoin()),
        content: owContent(),
    }),
};

export const owMsgSubmitProposalOptions = owStrictObject().exactShape({
    proposer: ow.string,
    initialDeposit: owCoin(),
    content: owContent(),
});

export const owMsgDepositOptions = owStrictObject().exactShape({
    depositor: ow.string,
    proposalId: owBig(),
    amount: owCoin(),
});

export const owMsgVoteOptions = owStrictObject().exactShape({
    voter: ow.string,
    proposalId: owBig(),
    option: owVoteOption(),
});

export const owMsgCreateValidatorOptions = owStrictObject().exactShape({
    description: {
        moniker: ow.string,
        identity: ow.optional.string,
        website: ow.optional.string,
        securityContact: ow.optional.string,
        details: ow.optional.string,
    },
    commission: {
        rate: ow.string,
        maxRate: ow.string,
        maxChangeRate: ow.string,
    },
    minSelfDelegation: ow.string,
    delegatorAddress: ow.string,
    validatorAddress: ow.string,
    pubkey: ow.string,
    value: owCoin(),
});

export const owMsgEditValidatorOptions = owStrictObject().exactShape({
    description: {
        moniker: ow.optional.string,
        identity: ow.optional.string,
        website: ow.optional.string,
        securityContact: ow.optional.string,
        details: ow.optional.string,
    },
    validatorAddress: ow.string,
    commissionRate: ow.any(ow.string, ow.null),
    minSelfDelegation: ow.any(ow.string, ow.null),
});

export const owMsgWithdrawDelegatorRewardOptions = owStrictObject().exactShape({
    delegatorAddress: ow.string,
    validatorAddress: ow.string,
});

export const owMsgSetWithdrawAddressOptions = owStrictObject().exactShape({
    delegatorAddress: ow.string,
    withdrawAddress: ow.string,
});

export const owMsgFundCommunityPoolOptions = owStrictObject().exactShape({
    depositor: ow.string,
    amount: owCoin(),
});

export const owMsgDelegateOptions = owStrictObject().exactShape({
    delegatorAddress: ow.string,
    validatorAddress: ow.string,
    amount: owCoin(),
});

export const owMsgUndelegateOptions = owStrictObject().exactShape({
    delegatorAddress: ow.string,
    validatorAddress: ow.string,
    amount: owCoin(),
});

export const owMsgWithdrawValidatorCommissionOptions = owStrictObject().exactShape({
    validatorAddress: ow.string,
});

export const owMsgBeginRedelgateOptions = owStrictObject().exactShape({
    delegatorAddress: ow.string,
    validatorDstAddress: ow.string,
    validatorSrcAddress: ow.string,
    amount: owCoin(),
});

/**
 * nft ow types here
 */

const owNFTStartWithAlphabetValidatorFn = (val: string) => ({
    validator: /^[a-z]/.test(val),
    message: (label: string) => `Expected ${label} to start with lowercase alphabets`,
});

const owNFTIsAlphaNumericValidatorFn = (val: string) => ({
    validator: /^[a-z0-9]+$/.test(val),
    message: (label: string) => `Expected ${label} to contain only lowercase alphanumeric characters`,
});

const owNFTId = ow.string
    .minLength(3)
    .maxLength(64)
    .validate(owNFTStartWithAlphabetValidatorFn)
    .validate(owNFTIsAlphaNumericValidatorFn);

const owNFTNameValidator = (val: string) => ({
    validator: val.replace(/\s/g, '').length > 0,
    message: (label: string) => `Expected ${label} to be non-empty string`,
});

const URI_MAX_LENGTH = 256;

export const owMsgIssueDenomOptions = owStrictObject().exactShape({
    id: owNFTId,
    name: ow.string.validate(owNFTNameValidator),
    schema: ow.string,
    sender: ow.string,
});

export const owMsgMintNFTOptions = owStrictObject().exactShape({
    id: owNFTId,
    denomId: owNFTId,
    name: ow.string.validate(owNFTNameValidator),
    uri: ow.string.maxLength(URI_MAX_LENGTH),
    data: ow.string,
    sender: ow.string,
    recipient: ow.string,
});

export const owMsgEditNFTOptions = owStrictObject().exactShape({
    id: owNFTId,
    denomId: owNFTId,
    name: ow.string.validate(owNFTNameValidator),
    uri: ow.string.maxLength(URI_MAX_LENGTH),
    data: ow.string,
    sender: ow.string,
});

export const owMsgTransferNFTOptions = owStrictObject().exactShape({
    id: owNFTId,
    denomId: owNFTId,
    sender: ow.string,
    recipient: ow.string,
});

export const owMsgBurnNFTOptions = owStrictObject().exactShape({
    id: owNFTId,
    denomId: owNFTId,
    sender: ow.string,
});

/**
 * IBC ow types
 */

const owIBCHeightOptional = () =>
    owOptionalStrictObject().exactShape({
        revisionHeight: owLong(),
        revisionNumber: owLong(),
    });

const owGoogleProtoAnyOptional = () =>
    owOptionalStrictObject().exactShape({
        type_url: ow.optional.string,
        value: ow.optional.uint8Array,
    });

export const owMsgTransferIBCOptions = owStrictObject().exactShape({
    sourcePort: ow.string,
    sourceChannel: ow.string,
    token: owOptionalCoin(),
    sender: ow.string,
    receiver: ow.string,
    timeoutHeight: owIBCHeightOptional(),
    timeoutTimestamp: owLong(),
});

export const owMsgCreateClientOptions = owStrictObject().exactShape({
    signer: ow.string,
    clientState: ow.optional.any(owGoogleProtoAnyOptional(), ow.null),
    consensusState: ow.optional.any(owGoogleProtoAnyOptional(), ow.null),
});

export const owMsgUpdateClientOptions = owStrictObject().exactShape({
    signer: ow.string,
    clientId: ow.string,
    header: ow.optional.any(owGoogleProtoAnyOptional(), ow.optional.null),
});

export const owMsgUpgradeClientOptions = owStrictObject().exactShape({
    clientId: ow.string,
    clientState: ow.optional.any(owGoogleProtoAnyOptional(), ow.optional.null),
    consensusState: ow.optional.any(owGoogleProtoAnyOptional(), ow.optional.null),
    proofUpgradeClient: ow.uint8Array,
    proofUpgradeConsensusState: ow.uint8Array,
    signer: ow.string,
});
export const owMsgSubmitMisbehaviourOptions = owStrictObject().exactShape({
    clientId: ow.string,
    misbehaviour: ow.optional.any(owGoogleProtoAnyOptional(), ow.optional.null),
    signer: ow.string,
});
