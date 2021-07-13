/* eslint-disable camelcase */
import ow from 'ow';
import { google } from '../../../../cosmos/v1beta1/codec/generated/codecimpl';
import { InitConfigurations } from '../../../../core/cro';
import { CosmosMsg } from '../../cosmosMsg';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { validateAddress, AddressType } from '../../../../utils/address';
import { owMsgUpdateClientOptions } from '../../ow.types';
import * as legacyAmino from '../../../../cosmos/amino';
import { Network } from '../../../../network/network';

export const msgUpdateClientIBC = function (config: InitConfigurations) {
    return class MsgUpdateClient implements CosmosMsg {
        /** MsgUpdateClient clientId. */
        public clientId: string;

        /** MsgUpdateClient header. */
        public header?: google.protobuf.IAny | null;

        /** MsgUpdateClient signer. */
        public signer: string;

        /**
         * Constructor to create a new IBC.MsgUpdateClient
         * @param {MsgUpdateClientOptions} options
         * @returns {MsgUpdateClient}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgUpdateClientOptions) {
            ow(options, 'options', owMsgUpdateClientOptions);
            this.clientId = options.clientId;
            this.header = options.header;
            this.signer = options.signer;
            this.validateAddresses();
        }

        /**
         * Returns the raw Msg representation of Ibc.MsgUpdateClient
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgUpdateClient,
                value: {
                    clientId: this.clientId,
                    header: this.header,
                    signer: this.signer,
                },
            };
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('IBC Module not supported under amino encoding scheme');
        }

        /**
         * Returns an instance of IBC.MsgUpdateClient
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgUpdateClient}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgUpdateClient {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgUpdateClientJsonRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.ibc.MsgUpdateClient) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.ibc.MsgUpdateClient} but got ${parsedMsg['@type']}`);
            }

            // TODO: The `header` value needs to be handled, currently keeping it as `null`
            if (typeof parsedMsg.header === 'object' && Object.keys(parsedMsg.header).length > 0) {
                throw new Error('IBC MsgUpdateClient does not support `header` decoding.');
            }

            return new MsgUpdateClient({
                clientId: parsedMsg.client_id,
                header: null,
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

export type MsgUpdateClientOptions = {
    clientId: string;
    header?: google.protobuf.IAny | null;
    signer: string;
};

export interface MsgUpdateClientJsonRaw {
    '@type': string;
    client_id: string;
    header?: any | MsgUpdateClientJsonRawHeader;
    signer: string;
}

export interface MsgUpdateClientJsonRawHeader {
    '@type': string;
    signed_header: SignedHeader;
    validator_set: TrustedValidators;
    trusted_height: TrustedHeight;
    trusted_validators: TrustedValidators;
}

export interface SignedHeader {
    header: SignedHeaderHeader;
    commit: Commit;
}

export interface Commit {
    height: string;
    round: number;
    block_id: Blockid;
    signatures: Signature[];
}

export interface Blockid {
    hash: string;
    part_set_header: PartSetHeader;
}

export interface PartSetHeader {
    total: number;
    hash: string;
}

export interface Signature {
    block_id_flag: BlockidFlag;
    validator_address: null | string;
    timestamp: Date;
    signature: null | string;
}

export enum BlockidFlag {
    BlockIDFlagAbsent = 'BLOCK_ID_FLAG_ABSENT',
    BlockIDFlagCommit = 'BLOCK_ID_FLAG_COMMIT',
}

export interface SignedHeaderHeader {
    version: Version;
    chain_id: string;
    height: string;
    time: Date;
    last_block_id: Blockid;
    last_commit_hash: string;
    data_hash: string;
    validators_hash: string;
    next_validators_hash: string;
    consensus_hash: string;
    app_hash: string;
    last_results_hash: string;
    evidence_hash: string;
    proposer_address: string;
}

export interface Version {
    block: string;
    app: string;
}

export interface TrustedHeight {
    revision_number: string;
    revision_height: string;
}

export interface TrustedValidators {
    validators: Proposer[];
    proposer: Proposer;
    total_voting_power: string;
}

export interface Proposer {
    address: string;
    pub_key: PubKey;
    voting_power: string;
    proposer_priority: string;
}

export interface PubKey {
    ed25519: string;
}
