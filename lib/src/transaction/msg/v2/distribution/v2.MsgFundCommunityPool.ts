import ow from 'ow';
import { CosmosMsg } from '../../cosmosMsg';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { InitConfigurations, CroSDK } from '../../../../core/cro';
import { AddressType, validateAddress } from '../../../../utils/address';
import { v2 } from '../../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import * as legacyAmino from '../../../../cosmos/amino';
import { ICoin } from '../../../../coin/coin';
import { Network } from '../../../../network/network';

export const msgFundCommunityPoolV2 = function (config: InitConfigurations) {
    return class MsgFundCommunityPoolV2 implements CosmosMsg {
        // Normal user addresses with (t)cro prefix
        public readonly depositor: string;

        public amount: ICoin[];

        /**
         * Constructor to create a new MsgFundCommunityPool
         * @param {MsgFundCommunityPoolOptions} options
         * @returns {MsgFundCommunityPoolV2}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgFundCommunityPoolOptions) {
            ow(options, 'communityPoolOptions', v2.owMsgFundCommunityPoolOptions);

            this.depositor = options.depositor;
            this.amount = options.amount;

            this.validateAddresses();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'cosmos-sdk/MsgFundCommunityPool',
                value: {
                    depositor: this.depositor,
                    amount: this.amount.map((coin) => coin.toCosmosCoin()),
                },
            } as legacyAmino.MsgFundCommunityPool;
        }

        /**
         * Returns the raw Msg representation of MsgFundCommunityPool
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.distribution.MsgFundCommunityPool,
                value: {
                    depositor: this.depositor,
                    amount: this.amount.map((coin) => coin.toCosmosCoin()),
                },
            };
        }

        /**
         * Returns an instance of MsgFundCommunityPool
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgFundCommunityPool}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgFundCommunityPoolV2 {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgFundCommunityPoolRaw;
            const cro = CroSDK({ network });
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.distribution.MsgFundCommunityPool) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.distribution.MsgFundCommunityPool} but got ${parsedMsg['@type']}`,
                );
            }
            if (!parsedMsg.amount || parsedMsg.amount.length < 1) {
                throw new Error('Invalid amount in the Msg.');
            }

            return new MsgFundCommunityPoolV2({
                depositor: parsedMsg.depositor,
                amount: parsedMsg.amount.map((coin) => cro.Coin.fromCustomAmountDenom(coin.amount, coin.denom)),
            });
        }

        validateAddresses() {
            if (
                !validateAddress({
                    address: this.depositor,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `depositor` address doesnt match network selected');
            }
        }
    };
};

export type MsgFundCommunityPoolOptions = {
    depositor: string;
    amount: ICoin[];
};
interface MsgFundCommunityPoolRaw {
    '@type': string;
    amount: Amount[];
    depositor: string;
}

interface Amount {
    denom: string;
    amount: string;
}
