/* eslint-disable camelcase */
import Big from 'big.js';
import Long from 'long';
import ow from 'ow';
import { InitConfigurations } from '../../../core/cro';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { AddressType, validateAddress } from '../../../utils/address';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import { owMsgVoteOptions } from '../ow.types';
import { CosmosMsg } from '../cosmosMsg';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export enum VoteOption {
    VOTE_OPTION_UNSPECIFIED = 0,
    VOTE_OPTION_YES = 1,
    VOTE_OPTION_ABSTAIN = 2,
    VOTE_OPTION_NO = 3,
    VOTE_OPTION_NO_WITH_VETO = 4,
}

export const msgVote = function (config: InitConfigurations) {
    return class MsgVote implements CosmosMsg {
        public proposalId: Big;

        public voter: string;

        public option: VoteOption;

        constructor(options: MsgVoteOptions) {
            ow(options, 'options', owMsgVoteOptions);

            this.proposalId = options.proposalId;
            this.voter = options.voter;
            this.option = options.option;

            this.validate();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            let aminooption = legacyAmino.VoteOption.VoteOptionUnspecified;
            switch (this.option) {
                case VoteOption.VOTE_OPTION_UNSPECIFIED:
                    aminooption = legacyAmino.VoteOption.VoteOptionUnspecified;
                    break;
                case VoteOption.VOTE_OPTION_YES:
                    aminooption = legacyAmino.VoteOption.VoteOptionYes;
                    break;
                case VoteOption.VOTE_OPTION_ABSTAIN:
                    aminooption = legacyAmino.VoteOption.VoteOptionAbstain;
                    break;
                case VoteOption.VOTE_OPTION_NO:
                    aminooption = legacyAmino.VoteOption.VoteOptionNo;
                    break;
                case VoteOption.VOTE_OPTION_NO_WITH_VETO:
                    aminooption = legacyAmino.VoteOption.VoteOptionNoWithVeto;
                    break;
                default:
                    // assert false
                    break;
            }
            return {
                type: 'cosmos-sdk/MsgVote',
                value: {
                    proposal_id: this.proposalId.toString(),
                    voter: this.voter,
                    option: aminooption,
                },
            } as legacyAmino.MsgVote;
        }

        toRawMsg(): Msg {
            const proposal = Long.fromString(this.proposalId.toString(), true);
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgVote,
                value: {
                    proposalId: proposal,
                    voter: this.voter,
                    option: this.option,
                },
            };
        }

        /**
         * Returns an instance of MsgVote
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgVote}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgVote {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgVoteRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgVote) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgVote} but got ${parsedMsg['@type']}`);
            }

            if (!parsedMsg.proposal_id) {
                throw new Error('Invalid `proposal_id` in JSON.');
            }

            return new MsgVote({
                proposalId: new Big(parsedMsg.proposal_id),
                voter: parsedMsg.voter,
                option: parsedMsg.option,
            });
        }

        validate() {
            if (
                !validateAddress({
                    address: this.voter,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `voter` doesnt match network selected');
            }
        }
    };
};

export type MsgVoteOptions = {
    proposalId: Big;
    voter: string;
    option: VoteOption;
};

interface MsgVoteRaw {
    '@type': string;
    proposal_id: string;
    voter: string;
    option: number;
}
