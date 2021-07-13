/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { CosmosMsg } from '../cosmosMsg';
import { ICoin } from '../../../coin/coin';
import { owMsgCreateValidatorOptions } from '../ow.types';
import { InitConfigurations, CroSDK } from '../../../core/cro';
import { validateAddress, AddressType } from '../../../utils/address';
import { IDescription } from '../../common/interface/IDescription';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import { ICommissionRates } from '../../common/interface/ICommissionRates';
import { google, cosmos } from '../../../cosmos/v1beta1/codec';
import { Bytes } from '../../../utils/bytes/bytes';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export const msgCreateValidator = function (config: InitConfigurations) {
    return class MsgCreateValidator implements CosmosMsg {
        public readonly description: IDescription;

        public readonly commission: ICommissionRates;

        public minSelfDelegation: string;

        public delegatorAddress: string;

        public validatorAddress: string;

        public pubkey: string;

        public value: ICoin;

        /**
         * Constructor to create a new MsgSend
         * @param {MsgCreateValidatorParams} options
         * @returns {MsgCreateValidator}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgCreateValidatorParams) {
            ow(options, 'options', owMsgCreateValidatorOptions);
            this.description = options.description;
            this.commission = options.commission;
            this.minSelfDelegation = options.minSelfDelegation;
            this.delegatorAddress = options.delegatorAddress;
            this.validatorAddress = options.validatorAddress;
            this.pubkey = options.pubkey;
            this.value = options.value;
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
            const cosmosCoin = this.value.toCosmosCoin();
            const pubkeyEncoded = protoEncodeEd25519PubKey(Bytes.fromBase64String(this.pubkey));
            return {
                typeUrl: COSMOS_MSG_TYPEURL.MsgCreateValidator,
                value: {
                    description: this.description,
                    commission: this.commission,
                    minSelfDelegation: this.minSelfDelegation,
                    delegatorAddress: this.delegatorAddress,
                    validatorAddress: this.validatorAddress,
                    pubkey: pubkeyEncoded,
                    value: {
                        denom: cosmosCoin.denom,
                        amount: cosmosCoin.amount,
                    },
                },
            };
        }

        /**
         * Returns an instance of MsgCreateValidator
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgCreateValidator}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): MsgCreateValidator {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgCreateValidatorRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.MsgCreateValidator) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.MsgCreateValidator} but got ${parsedMsg['@type']}`);
            }

            if (!parsedMsg.value || Object.keys(parsedMsg.value).length !== 2) {
                throw new Error('Invalid value in the Msg.');
            }

            if (!parsedMsg.commission || Object.keys(parsedMsg.commission).length < 1) {
                throw new Error('Invalid commission in the Msg.');
            }

            if (!parsedMsg.description || Object.keys(parsedMsg.description).length < 1) {
                throw new Error('Invalid description in the Msg.');
            }

            const parsedPubKey: { value?: { [key: string]: number } } = parsedMsg.pubkey as any;

            if (!parsedMsg.pubkey || Object.keys(parsedMsg.pubkey).length !== 2) {
                throw new Error('Invalid pubkey in the Msg.');
            }
            let pubkey: string = parsedMsg.pubkey.key;

            if (parsedPubKey && parsedPubKey.value && Object.keys(parsedPubKey.value).length > 0) {
                pubkey = Bytes.fromUint8Array(
                    new Uint8Array(Object.values(parsedPubKey.value).slice(2)),
                ).toBase64String();
            }

            const cro = CroSDK({ network });

            return new MsgCreateValidator({
                description: {
                    moniker: parsedMsg.description.moniker,
                    identity: parsedMsg.description.identity,
                    website: parsedMsg.description.website,
                    securityContact: parsedMsg.description.security_contact,
                    details: parsedMsg.description.details,
                },
                commission: {
                    rate: parsedMsg.commission.rate,
                    maxChangeRate: parsedMsg.commission.max_change_rate,
                    maxRate: parsedMsg.commission.max_rate,
                },
                value: cro.Coin.fromCustomAmountDenom(parsedMsg.value.amount, parsedMsg.value.denom),
                validatorAddress: parsedMsg.validator_address,
                pubkey,
                minSelfDelegation: parsedMsg.min_self_delegation,
                delegatorAddress: parsedMsg.delegator_address,
            });
        }

        validateAddresses(): void {
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
export interface MsgCreateValidatorRaw {
    '@type': string;
    description: Description;
    commission: Commission;
    min_self_delegation: string;
    delegator_address: string;
    validator_address: string;
    pubkey: Pubkey;
    value: Amount;
}

export interface Commission {
    rate: string;
    max_rate: string;
    max_change_rate: string;
}

export interface Description {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
}

export interface Pubkey {
    '@type': string;
    key: string;
}

export interface Amount {
    denom: string;
    amount: string;
}

export type MsgCreateValidatorParams = {
    description: IDescription;
    commission: ICommissionRates;
    minSelfDelegation: string;
    delegatorAddress: string;
    validatorAddress: string;
    pubkey: string;
    value: ICoin;
};

/**
 * Encode public key bytes to corresponding proto model
 * @returns {IAny}
 */
export const protoEncodeEd25519PubKey = (pubKey: Bytes): google.protobuf.IAny => {
    const pubKeyProto = cosmos.crypto.ed25519.PubKey.create({
        key: pubKey.toUint8Array(),
    });
    return google.protobuf.Any.create({
        type_url: COSMOS_MSG_TYPEURL.PubKey.ed25519,
        value: Uint8Array.from(cosmos.crypto.ed25519.PubKey.encode(pubKeyProto).finish()),
    });
};
