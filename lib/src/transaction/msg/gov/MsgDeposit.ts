/* eslint-disable camelcase */
import Big from 'big.js';
import Long from 'long';
import ow from 'ow';
import { InitConfigurations, CroSDK } from '../../../core/cro';
import { CosmosMsg } from '../cosmosMsg';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { ICoin } from '../../../coin/coin';
import { AddressType, validateAddress } from '../../../utils/address';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import { owMsgDepositOptions } from '../ow.types';
import * as legacyAmino from '../../../cosmos/amino';
import { Amount } from '../bank/msgsend';
import { Network } from '../../../network/network';

export const msgDeposit = function (config: InitConfigurations) {
    return class MsgDeposit implements CosmosMsg {
        public proposalId: Big;

        public depositor: string;

        public amount: ICoin;

        /**
         * Constructor to create a new MsgDeposit
         * @param {MsgDepositOptions} options
         * @returns {MsgDeposit}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgDepositOptions) {
            ow(options, 'options', owMsgDepositOptions);

            this.proposalId = options.proposalId;
            this.depositor = options.depositor;
            this.amount = options.amount;

            this.validate();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('Method not implemented.');
        }

        /**
         * Returns the raw Msg representation of MsgDeposit
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            const cosmosAmount = this.amount.toCosmosCoin();
            const proposal = Long.fromNumber(this.proposalId.toNumber(), true);
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgDeposit,
                value: {
                    proposalId: proposal,
                    depositor: this.depositor,
                    amount: [
                        {
                            denom: cosmosAmount.denom,
                            amount: cosmosAmount.amount,
                        },
                    ],
                },
            };
        }

        /**
         * Returns an instance of MsgDeposit
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgDeposit}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgDeposit {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgDepositRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgDeposit) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgDeposit} but got ${parsedMsg['@type']}`);
            }

            if (!parsedMsg.proposal_id) {
                throw new Error('Invalid `proposal_id` in JSON.');
            }

            if (!parsedMsg.amount || parsedMsg.amount.length !== 1) {
                throw new Error('Invalid amount in the Msg.');
            }

            const cro = CroSDK({ network });

            return new MsgDeposit({
                proposalId: new Big(parsedMsg.proposal_id),
                depositor: parsedMsg.depositor,
                amount: cro.Coin.fromCustomAmountDenom(parsedMsg.amount[0].amount, parsedMsg.amount[0].denom),
            });
        }

        validate() {
            if (
                !validateAddress({
                    address: this.depositor,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `depositor` doesnt match network selected');
            }
        }
    };
};

export type MsgDepositOptions = {
    proposalId: Big;
    depositor: string;
    amount: ICoin;
};

interface MsgDepositRaw {
    '@type': string;
    proposal_id: string;
    depositor: string;
    amount: Amount[];
}
