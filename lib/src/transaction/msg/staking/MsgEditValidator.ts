/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { CosmosMsg } from '../cosmosMsg';
import { owMsgEditValidatorOptions } from '../ow.types';
import { InitConfigurations } from '../../../core/cro';
import { validateAddress, AddressType } from '../../../utils/address';
import { IDescription } from '../../common/interface/IDescription';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export const msgEditValidator = function (config: InitConfigurations) {
    return class MsgEditValidator implements CosmosMsg {
        public readonly description: IDescription;

        public minSelfDelegation: string | null;

        public commissionRate: string | null;

        public validatorAddress: string;

        /**
         * Constructor to create a new MsgSend
         * @param {MsgCreateEditOptions} options
         * @returns {MsgEditValidator}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgCreateEditOptions) {
            ow(options, 'options', owMsgEditValidatorOptions);
            this.description = options.description;
            this.commissionRate = options.commissionRate;
            this.minSelfDelegation = options.minSelfDelegation;
            this.validatorAddress = options.validatorAddress;
            this.validateAddresses();
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('Method not implemented.');
        }

        /**
         * Returns the raw Msg representation of MsgCreateValidator
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgEditValidator,
                value: {
                    description: this.description,
                    commissionRate: this.commissionRate,
                    minSelfDelegation: this.minSelfDelegation,
                    validatorAddress: this.validatorAddress,
                },
            };
        }

        /**
         * Returns an instance of MsgEditValidator
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgEditValidator}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgEditValidator {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgEditValidatorRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgEditValidator) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgEditValidator} but got ${parsedMsg['@type']}`);
            }

            return new MsgEditValidator({
                description: {
                    moniker: parsedMsg.description.moniker,
                    identity: parsedMsg.description.identity,
                    website: parsedMsg.description.website,
                    securityContact: parsedMsg.description.security_contact,
                    details: parsedMsg.description.details,
                },
                validatorAddress: parsedMsg.validator_address,
                commissionRate: parsedMsg.commission_rate || null,
                minSelfDelegation: parsedMsg.min_self_delegation || null,
            });
        }

        validateAddresses(): void {
            const { network } = config;

            if (!validateAddress({ network, address: this.validatorAddress, type: AddressType.VALIDATOR })) {
                throw new TypeError('Provided `validatorAddress` doesnt match network selected');
            }
        }
    };
};

export interface MsgEditValidatorRaw {
    '@type': string;
    description: DescriptionRaw;
    validator_address: string;
    commission_rate: string;
    min_self_delegation: string;
}

export interface DescriptionRaw {
    moniker?: string | null;
    identity?: string | null;
    website?: string | null;
    security_contact?: string | null;
    details?: string | null;
}

export type MsgCreateEditOptions = {
    description: IDescription;
    commissionRate: string | null;
    minSelfDelegation: string | null;
    validatorAddress: string;
};
