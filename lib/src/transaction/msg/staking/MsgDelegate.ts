/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { CosmosMsg } from '../cosmosMsg';
import { owMsgDelegateOptions } from '../ow.types';
import { InitConfigurations, CroSDK } from '../../../core/cro';
import { validateAddress, AddressType } from '../../../utils/address';
import { ICoin } from '../../../coin/coin';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export interface MsgDelegateRaw {
    '@type': string;
    delegator_address: string;
    validator_address: string;
    amount: Amount;
}

export interface Amount {
    denom: string;
    amount: string;
}

export const msgDelegate = function (config: InitConfigurations) {
    return class MsgDelegate implements CosmosMsg {
        /** MsgDelegate delegatorAddress. */
        public delegatorAddress: string;

        /** MsgDelegate validatorAddress. */
        public validatorAddress: string;

        /** MsgDelegate amount. */
        public amount: ICoin;

        /**
         * Constructor to create a new MsgSend
         * @param {IMsgDelegate} options
         * @returns {MsgDelegate}
         * @throws {Error} when options is invalid
         */
        constructor(options: IMsgDelegate) {
            ow(options, 'options', owMsgDelegateOptions);
            this.delegatorAddress = options.delegatorAddress;
            this.validatorAddress = options.validatorAddress;
            this.amount = options.amount;
            this.validateAddresses();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'cosmos-sdk/MsgDelegate',
                value: {
                    delegator_address: this.delegatorAddress,
                    validator_address: this.validatorAddress,
                    amount: this.amount.toCosmosCoin(),
                },
            } as legacyAmino.MsgDelegate;
        }

        /**
         * Returns the raw Msg representation of MsgDelegate
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            const cosmosCoin = this.amount.toCosmosCoin();
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgDelegate,
                value: {
                    delegatorAddress: this.delegatorAddress,
                    validatorAddress: this.validatorAddress,
                    amount: {
                        denom: cosmosCoin.denom,
                        amount: cosmosCoin.amount,
                    },
                },
            };
        }

        /**
         * Returns an instance of MsgDelegate
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgDelegate}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgDelegate {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgDelegateRaw;
            const cro = CroSDK({ network });
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgDelegate) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgDelegate} but got ${parsedMsg['@type']}`);
            }
            if (!parsedMsg.amount || Object.keys(parsedMsg.amount).length !== 2) {
                throw new Error('Invalid amount in the Msg.');
            }

            return new MsgDelegate({
                delegatorAddress: parsedMsg.delegator_address,
                validatorAddress: parsedMsg.validator_address,
                amount: cro.Coin.fromCustomAmountDenom(parsedMsg.amount.amount, parsedMsg.amount.denom),
            });
        }

        validateAddresses(): void {
            const { network } = config;

            if (!validateAddress({ network, address: this.validatorAddress, type: AddressType.VALIDATOR })) {
                throw new TypeError('Provided `validatorAddress` doesnt match network selected');
            }

            if (!validateAddress({ network, address: this.delegatorAddress, type: AddressType.USER })) {
                throw new TypeError('Provided `delegatorAddress` doesnt match network selected');
            }
        }
    };
};

export type IMsgDelegate = {
    delegatorAddress: string;
    validatorAddress: string;
    amount: ICoin;
};
