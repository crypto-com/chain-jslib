/* eslint-disable camelcase */
import ow from 'ow';
import { IMsgProposalContent } from '../../gov/IMsgProposalContent';
import { InitConfigurations, CroSDK } from '../../../../core/cro';
import { CosmosMsg } from '../../cosmosMsg';
import { ICoin } from '../../../../coin/coin';
import { v2 } from '../../ow.types';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { COSMOS_MSG_TYPEURL, typeUrlToMsgClassMapping } from '../../../common/constants/typeurl';
import { Network } from '../../../../network/network';
import { validateAddress, AddressType } from '../../../../utils/address';
import { Amount } from '../../bank/msgsend';
import * as legacyAmino from '../../../../cosmos/amino';

export const msgSubmitProposalV2 = function (config: InitConfigurations) {
    return class MsgSubmitProposalV2 implements CosmosMsg {
        public readonly proposer: string;

        public readonly initialDeposit: ICoin[];

        public readonly content: IMsgProposalContent;

        /**
         * Constructor to create a new MsgSubmitProposal
         * @param {ProposalOptions} options
         * @returns {MsgSubmitProposal}
         * @throws {Error} when options is invalid
         */
        constructor(options: ProposalOptions) {
            ow(options, 'options', v2.owMsgSubmitProposalOptions);
            this.proposer = options.proposer;
            this.initialDeposit = options.initialDeposit;
            this.content = options.content;

            this.validate();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('Method not implemented.');
        }

        /**
         * Returns the raw Msg representation of MsgSubmitProposal
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgSubmitProposal,
                value: {
                    proposer: this.proposer,
                    content: this.content.getEncoded(),
                    initialDeposit: this.initialDeposit.map((coin) => coin.toCosmosCoin()),
                },
            };
        }

        /**
         * Returns an instance of MsgSubmitProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgSubmitProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgSubmitProposalV2 {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgSubmitProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgSubmitProposal) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgSubmitProposal} but got ${parsedMsg['@type']}`);
            }

            if (!parsedMsg.initial_deposit || parsedMsg.initial_deposit.length < 1) {
                throw new Error('Invalid initial_deposit in the Msg.');
            }

            const cro = CroSDK({ network });

            const jsonContentRaw = parsedMsg.content;
            const contentClassInstance = typeUrlToMsgClassMapping(cro, jsonContentRaw['@type']);
            const nativeContentMsg: IMsgProposalContent = contentClassInstance.fromCosmosMsgJSON(
                JSON.stringify(jsonContentRaw),
                network,
            );

            return new MsgSubmitProposalV2({
                proposer: parsedMsg.proposer,
                initialDeposit: parsedMsg.initial_deposit.map((coin) =>
                    cro.Coin.fromCustomAmountDenom(coin.amount, coin.denom),
                ),
                content: nativeContentMsg,
            });
        }

        validate() {
            if (
                !validateAddress({
                    address: this.proposer,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `proposer` doesnt match network selected');
            }
        }
    };
};

export type ProposalOptions = {
    proposer: string;
    initialDeposit: ICoin[];
    content: IMsgProposalContent;
};

export interface MsgSubmitProposalRaw {
    '@type': string;
    initial_deposit: Amount[];
    content: Content;
    proposer: string;
}

export interface Content {
    '@type': string;
    [key: string]: any;
}
