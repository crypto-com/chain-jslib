/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { CosmosMsg } from '../cosmosMsg';
import { ICoin } from '../../../coin/coin';
import { owMsgBeginRedelgateOptions } from '../ow.types';
import { InitConfigurations, CroSDK } from '../../../core/cro';
import { validateAddress, AddressType } from '../../../utils/address';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export interface MsgBeginRedelegateRaw {
    '@type': string;
    delegator_address: string;
    validator_src_address: string;
    validator_dst_address: string;
    amount: Amount;
}

export interface Amount {
    denom: string;
    amount: string;
}

export const msgBeginRedelegate = function (config: InitConfigurations) {
    return class MsgBeginRedelegate implements CosmosMsg {
        /** MsgBeginRedelegate delegatorAddress. */
        public delegatorAddress: string;

        /** MsgBeginRedelegate validatorSrcAddress. */
        public validatorSrcAddress: string;

        /** MsgBeginRedelegate validatorDstAddress. */
        public validatorDstAddress: string;

        /** MsgBeginRedelegate amount. */
        public amount: ICoin;

        /**
         * Constructor to create a new MsgSend
         * @param {IMsgBeginRedelgate} options
         * @returns {MsgBeginRedelegate}
         * @throws {Error} when options are invalid
         */
        constructor(options: IMsgBeginRedelgate) {
            ow(options, 'options', owMsgBeginRedelgateOptions);
            this.delegatorAddress = options.delegatorAddress;
            this.validatorDstAddress = options.validatorDstAddress;
            this.validatorSrcAddress = options.validatorSrcAddress;
            this.amount = options.amount;
            this.validateAddresses();
        }

        /**
         * Returns an instance of MsgBeginRedelegate
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgBeginRedelegate}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgBeginRedelegate {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgBeginRedelegateRaw;
            const cro = CroSDK({ network });
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgBeginRedelegate) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgBeginRedelegate} but got ${parsedMsg['@type']}`);
            }
            if (!parsedMsg.amount || Object.keys(parsedMsg.amount).length !== 2) {
                throw new Error('Invalid amount in the Msg.');
            }

            return new MsgBeginRedelegate({
                delegatorAddress: parsedMsg.delegator_address,
                validatorDstAddress: parsedMsg.validator_dst_address,
                validatorSrcAddress: parsedMsg.validator_src_address,
                amount: cro.Coin.fromCustomAmountDenom(parsedMsg.amount.amount, parsedMsg.amount.denom),
            });
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'cosmos-sdk/MsgBeginRedelegate',
                value: {
                    delegator_address: this.delegatorAddress,
                    validator_src_address: this.validatorSrcAddress,
                    validator_dst_address: this.validatorDstAddress,
                    amount: this.amount.toCosmosCoin(),
                },
            } as legacyAmino.MsgBeginRedelegate;
        }

        /**
         * Returns the raw Msg representation of MsgCreateValidator
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            const cosmosCoin = this.amount.toCosmosCoin();
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgBeginRedelegate,
                value: {
                    delegatorAddress: this.delegatorAddress,
                    validatorDstAddress: this.validatorDstAddress,
                    validatorSrcAddress: this.validatorSrcAddress,
                    amount: {
                        denom: cosmosCoin.denom,
                        amount: cosmosCoin.amount,
                    },
                },
            };
        }

        validateAddresses(): void {
            if (this.validatorDstAddress === this.validatorSrcAddress) {
                throw new TypeError('Source and destination validator addresses cannot be the same.');
            }

            if (
                !validateAddress({
                    address: this.delegatorAddress,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `delegatorAddress` does not match with selected network');
            }

            if (
                !validateAddress({
                    address: this.validatorSrcAddress,
                    network: config.network,
                    type: AddressType.VALIDATOR,
                })
            ) {
                throw new TypeError('Provided `validatorSrcAddress` does not match with selected network');
            }
            if (
                !validateAddress({
                    address: this.validatorDstAddress,
                    network: config.network,
                    type: AddressType.VALIDATOR,
                })
            ) {
                throw new TypeError('Provided `validatorDstAddress` does not match with selected network');
            }
        }
    };
};

export interface IMsgBeginRedelgate {
    /** MsgBeginRedelegate delegatorAddress */
    delegatorAddress: string;

    /** MsgBeginRedelegate validatorSrcAddress */
    validatorSrcAddress: string;

    /** MsgBeginRedelegate validatorDstAddress */
    validatorDstAddress: string;

    /** MsgBeginRedelegate amount */
    amount: ICoin;
}
