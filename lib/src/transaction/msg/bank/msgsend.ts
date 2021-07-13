/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { ICoin } from '../../../coin/coin';
import { owMsgSendOptions } from '../ow.types';
import { InitConfigurations, CroSDK } from '../../../core/cro';
import { AddressType, validateAddress } from '../../../utils/address';
import { CosmosMsg } from '../cosmosMsg';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export interface MsgSendRaw {
    '@type': string;
    amount: Amount[];
    from_address: string;
    to_address: string;
}

export interface Amount {
    denom: string;
    amount: string;
}

export const msgSend = function (config: InitConfigurations) {
    return class MsgSend implements CosmosMsg {
        public readonly fromAddress: string;

        public readonly toAddress: string;

        public amount: ICoin;

        /**
         * Constructor to create a new MsgSend
         * @param {MsgSendOptions} options
         * @returns {MsgSend}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgSendOptions) {
            ow(options, 'options', owMsgSendOptions);

            this.fromAddress = options.fromAddress;
            this.toAddress = options.toAddress;
            this.amount = options.amount;

            this.validateAddresses();
        }

        /**
         * Returns an instance of MsgSend
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgSend}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgSend {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgSendRaw;
            const cro = CroSDK({ network });
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgSend) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgSend} but got ${parsedMsg['@type']}`);
            }
            if (!parsedMsg.amount || parsedMsg.amount.length !== 1) {
                throw new Error('Invalid amount in the Msg.');
            }

            return new MsgSend({
                fromAddress: parsedMsg.from_address,
                toAddress: parsedMsg.to_address,
                amount: cro.Coin.fromCustomAmountDenom(parsedMsg.amount[0].amount, parsedMsg.amount[0].denom),
            });
        }

        /**
         * Returns the raw Msg representation of MsgSend
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgSend,
                value: {
                    fromAddress: this.fromAddress,
                    toAddress: this.toAddress,
                    amount: this.amount.toCosmosCoins(),
                },
            };
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'cosmos-sdk/MsgSend',
                value: {
                    from_address: this.fromAddress,
                    to_address: this.toAddress,
                    amount: this.amount.toCosmosCoins(),
                },
            } as legacyAmino.MsgSend;
        }

        validateAddresses() {
            if (
                !validateAddress({
                    address: this.fromAddress,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `fromAddress` does not match network selected');
            }

            if (
                !validateAddress({
                    address: this.toAddress,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `toAddress` does not match network selected');
            }
        }
    };
};

export type MsgSendOptions = {
    fromAddress: string;
    toAddress: string;
    amount: ICoin;
};
