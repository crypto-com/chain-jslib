/* eslint-disable camelcase */
import ow from 'ow';
import { InitConfigurations, CroSDK } from '../../../core/cro';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { ICoin } from '../../../coin/coin';
import { COSMOS_MSG_TYPEURL, typeUrlToMsgClassMapping } from '../../common/constants/typeurl';
import { AddressType, validateAddress } from '../../../utils/address';
import { owMsgSubmitProposalOptions } from '../ow.types';
import { IMsgProposalContent } from './IMsgProposalContent';
import { CosmosMsg } from '../cosmosMsg';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';
import { Amount } from '../bank/msgsend';

export const msgSubmitProposal = function (config: InitConfigurations) {
    return class MsgSubmitProposal implements CosmosMsg {
        public readonly proposer: string;

        public readonly initialDeposit: ICoin;

        public readonly content: IMsgProposalContent;

        /**
         * Constructor to create a new MsgSubmitProposal
         * @param {ProposalOptions} options
         * @returns {MsgSubmitProposal}
         * @throws {Error} when options is invalid
         */
        constructor(options: ProposalOptions) {
            ow(options, 'options', owMsgSubmitProposalOptions);
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
            const cosmosAmount = this.initialDeposit.toCosmosCoin();
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgSubmitProposal,
                value: {
                    proposer: this.proposer,
                    content: this.content.getEncoded(),
                    initialDeposit: [
                        {
                            denom: cosmosAmount.denom,
                            amount: cosmosAmount.amount,
                        },
                    ],
                },
            };
        }

        /**
         * Returns an instance of MsgSubmitProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgSubmitProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgSubmitProposal {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgSubmitProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgSubmitProposal) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgSubmitProposal} but got ${parsedMsg['@type']}`);
            }

            if (!parsedMsg.initial_deposit || parsedMsg.initial_deposit.length !== 1) {
                throw new Error('Invalid initial_deposit in the Msg.');
            }

            const cro = CroSDK({ network });

            const jsonContentRaw = parsedMsg.content;
            const contentClassInstance = typeUrlToMsgClassMapping(cro, jsonContentRaw['@type']);
            const nativeContentMsg: IMsgProposalContent = contentClassInstance.fromCosmosMsgJSON(
                JSON.stringify(jsonContentRaw),
                network,
            );

            return new MsgSubmitProposal({
                proposer: parsedMsg.proposer,
                initialDeposit: cro.Coin.fromCustomAmountDenom(
                    parsedMsg.initial_deposit[0].amount,
                    parsedMsg.initial_deposit[0].denom,
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
    initialDeposit: ICoin;
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
