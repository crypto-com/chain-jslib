/* eslint-disable camelcase */
import ow from 'ow';
import { InitConfigurations } from '../../../core/cro';
import { CosmosMsg } from '../cosmosMsg';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { AddressType, validateAddress } from '../../../utils/address';
import { owMsgWithdrawValidatorCommissionOptions } from '../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export const msgWithdrawValidatorCommission = function (config: InitConfigurations) {
    return class MsgWithdrawValidatorCommission implements CosmosMsg {
        public readonly validatorAddress: string;

        /**
         * Constructor to create a new MsgWithdrawValidatorCommission
         * @param {MsgWithdrawValidatorCommissionOptions} options
         * @returns {MsgWithdrawValidatorCommission}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgWithdrawValidatorCommissionOptions) {
            ow(options, 'commissionWithdrawalOptions', owMsgWithdrawValidatorCommissionOptions);
            this.validatorAddress = options.validatorAddress;
            this.validateAddresses();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('Method not implemented.');
        }

        /**
         * Returns the raw Msg representation of MsgWithdrawValidatorCommission
         * @returns {Msg}
         * @memberof MsgWithdrawValidatorCommission
         */
        public toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgWithdrawValidatorCommission,
                value: {
                    validatorAddress: this.validatorAddress,
                },
            };
        }

        /**
         * * Returns an instance of MsgWithdrawValidatorCommission
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgWithdrawValidatorCommission}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgWithdrawValidatorCommission {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgWithdrawValidatorCommissionRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgWithdrawValidatorCommission) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.MsgWithdrawValidatorCommission} but got ${parsedMsg['@type']}`,
                );
            }

            return new MsgWithdrawValidatorCommission({
                validatorAddress: parsedMsg.validator_address,
            });
        }

        /**
         * Validate address
         * @throws {Error} when the validatorAddress is invalid
         */
        validateAddresses() {
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

export type MsgWithdrawValidatorCommissionOptions = {
    validatorAddress: string;
};

interface MsgWithdrawValidatorCommissionRaw {
    '@type': string;
    validator_address: string;
}
