/* eslint-disable camelcase */
import ow from 'ow';
import { CosmosMsg } from '../cosmosMsg';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { InitConfigurations } from '../../../core/cro';
import { AddressType, validateAddress } from '../../../utils/address';
import { owMsgWithdrawDelegatorRewardOptions } from '../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export const msgWithdrawDelegateReward = function (config: InitConfigurations) {
    return class MsgWithdrawDelegatorReward implements CosmosMsg {
        // Normal user addresses with (t)cro prefix
        public readonly delegatorAddress: string;

        // Addresses with the (t)crocncl prefix
        public readonly validatorAddress: string;

        /**
         * Constructor to create a new MsgWithdrawDelegatorReward
         * @param {MsgWithdrawDelegatorRewardOptions} options
         * @returns {MsgWithdrawDelegatorReward}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgWithdrawDelegatorRewardOptions) {
            ow(options, 'rewardOptions', owMsgWithdrawDelegatorRewardOptions);

            this.delegatorAddress = options.delegatorAddress;
            this.validatorAddress = options.validatorAddress;

            this.validateAddresses();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'cosmos-sdk/MsgWithdrawDelegationReward',
                value: {
                    delegator_address: this.delegatorAddress,
                    validator_address: this.validatorAddress,
                },
            } as legacyAmino.MsgWithdrawDelegatorReward;
        }

        /**
         * Returns the raw Msg representation of MsgWithdrawDelegatorReward
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgWithdrawDelegatorReward,
                value: {
                    delegatorAddress: this.delegatorAddress,
                    validatorAddress: this.validatorAddress,
                },
            };
        }

        /**
         * * Returns an instance of MsgWithdrawDelegatorReward
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgWithdrawDelegatorReward}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgWithdrawDelegatorReward {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgWithdrawDelegatorRewardRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgWithdrawDelegatorReward) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.MsgWithdrawDelegatorReward} but got ${parsedMsg['@type']}`,
                );
            }

            return new MsgWithdrawDelegatorReward({
                validatorAddress: parsedMsg.validator_address,
                delegatorAddress: parsedMsg.delegator_address,
            });
        }

        validateAddresses() {
            if (
                !validateAddress({
                    address: this.delegatorAddress,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `delegatorAddress` doesnt match network selected');
            }

            if (
                !validateAddress({
                    address: this.validatorAddress,
                    network: config.network,
                    type: AddressType.VALIDATOR,
                })
            ) {
                throw new TypeError('Provided `validatorAddress` doesnt match network selected');
            }
        }
    };
};

export type MsgWithdrawDelegatorRewardOptions = {
    delegatorAddress: string;
    validatorAddress: string;
};

interface MsgWithdrawDelegatorRewardRaw {
    '@type': string;
    delegator_address: string;
    validator_address: string;
}
