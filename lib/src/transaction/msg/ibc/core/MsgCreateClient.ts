/* eslint-disable camelcase */
import ow from 'ow';
import { google } from '../../../../cosmos/v1beta1/codec/generated/codecimpl';
import { InitConfigurations } from '../../../../core/cro';
import { CosmosMsg } from '../../cosmosMsg';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { validateAddress, AddressType } from '../../../../utils/address';
import { owMsgCreateClientOptions } from '../../ow.types';
import * as legacyAmino from '../../../../cosmos/amino';
import { Network } from '../../../../network/network';

export const msgCreateClientIBC = function (config: InitConfigurations) {
    return class MsgCreateClient implements CosmosMsg {
        /** MsgCreateClient clientState. */
        public clientState?: google.protobuf.IAny | null;

        /** MsgCreateClient consensusState. */
        public consensusState?: google.protobuf.IAny | null;

        /** MsgCreateClient signer. */
        public signer: string;

        /**
         * Constructor to create a new IBC.MsgCreateClient
         * @param {MsgCreateClientOptions} options
         * @returns {MsgCreateClient}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgCreateClientOptions) {
            ow(options, 'options', owMsgCreateClientOptions);
            this.clientState = options.clientState;
            this.consensusState = options.consensusState;
            this.signer = options.signer;
            this.validateAddresses();
        }

        /**
         * Returns the raw Msg representation of Ibc.MsgCreateClient
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgCreateClient,
                value: {
                    clientState: this.clientState,
                    consensusState: this.consensusState,
                    signer: this.signer,
                },
            };
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('IBC Module not supported under amino encoding scheme');
        }

        /**
         * Returns an instance of IBC.MsgCreateClient
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgCreateClient}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgCreateClient {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgCreateClientJsonRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.ibc.MsgCreateClient) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.ibc.MsgCreateClient} but got ${parsedMsg['@type']}`);
            }

            // TODO: The `client_state` value needs to be handled, currently keeping it as `null`
            if (typeof parsedMsg.client_state === 'object' && Object.keys(parsedMsg.client_state).length > 0) {
                throw new Error('IBC MsgUpdateClient does not support `client_state` decoding.');
            }

            // TODO: The `consensus_state` value needs to be handled, currently keeping it as `null`
            if (typeof parsedMsg.consensus_state === 'object' && Object.keys(parsedMsg.consensus_state).length > 0) {
                throw new Error('IBC MsgUpdateClient does not support `consensus_state` decoding.');
            }

            return new MsgCreateClient({
                clientState: null,
                consensusState: null,
                signer: parsedMsg.signer,
            });
        }

        validateAddresses() {
            // TODO: Can `signer` be from non-CRO network
            if (
                !validateAddress({
                    address: this.signer,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `signer` does not match network selected');
            }
        }
    };
};

export type MsgCreateClientOptions = {
    clientState?: google.protobuf.IAny | null;
    consensusState?: google.protobuf.IAny | null;
    signer: string;
};

export interface MsgCreateClientJsonRaw {
    '@type': string;
    client_state?: ClientState;
    consensus_state?: ConsensusState;
    signer: string;
}

export interface ClientState {
    '@type': string;
    chain_id: string;
    trust_level: TrustLevel;
    trusting_period: string;
    unbonding_period: string;
    max_clock_drift: string;
    frozen_height: Height;
    latest_height: Height;
    proof_specs: ProofSpec[];
    upgrade_path: string[];
    allow_update_after_expiry: boolean;
    allow_update_after_misbehaviour: boolean;
}

export interface Height {
    revision_number: string;
    revision_height: string;
}

export interface ProofSpec {
    leaf_spec: LeafSpec;
    inner_spec: InnerSpec;
    max_depth: number;
    min_depth: number;
}

export interface InnerSpec {
    child_order: number[];
    child_size: number;
    min_prefix_length: number;
    max_prefix_length: number;
    empty_child: null;
    hash: string;
}

export interface LeafSpec {
    hash: string;
    prehash_key: string;
    prehash_value: string;
    length: string;
    prefix: string;
}

export interface TrustLevel {
    numerator: string;
    denominator: string;
}

export interface ConsensusState {
    '@type': string;
    timestamp: Date;
    root: Root;
    next_validators_hash: string;
}

export interface Root {
    hash: string;
}
