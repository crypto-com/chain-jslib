/* eslint-disable camelcase */
import ow from 'ow';
import { google } from '../../../../cosmos/v1beta1/codec/generated/codecimpl';
import { InitConfigurations } from '../../../../core/cro';
import { CosmosMsg } from '../../cosmosMsg';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { validateAddress, AddressType } from '../../../../utils/address';
import { owMsgUpgradeClientOptions } from '../../ow.types';
import * as legacyAmino from '../../../../cosmos/amino';
import { Network } from '../../../../network/network';

export const msgUpgradeClientIBC = function (config: InitConfigurations) {
    return class MsgUpgradeClient implements CosmosMsg {
        /** MsgUpgradeClient clientId. */
        public clientId: string;

        /** MsgUpgradeClient clientState. */
        public clientState?: google.protobuf.IAny | null;

        /** MsgUpgradeClient consensusState. */
        public consensusState?: google.protobuf.IAny | null;

        /** MsgUpgradeClient proofUpgradeClient. */
        public proofUpgradeClient: Uint8Array;

        /** MsgUpgradeClient proofUpgradeConsensusState. */
        public proofUpgradeConsensusState: Uint8Array;

        /** MsgUpgradeClient signer. */
        public signer: string;

        /**
         * Constructor to create a new IBC.MsgUpgradeClient
         * @param {MsgUpgradeClientOptions} options
         * @returns {MsgUpgradeClient}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgUpgradeClientOptions) {
            ow(options, 'options', owMsgUpgradeClientOptions);
            this.clientId = options.clientId;
            this.clientState = options.clientState;
            this.proofUpgradeClient = options.proofUpgradeClient;
            this.proofUpgradeConsensusState = options.proofUpgradeConsensusState;
            this.signer = options.signer;
            this.validateAddresses();
        }

        /**
         * Returns the raw Msg representation of Ibc.MsgUpgradeClient
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgUpgradeClient,
                value: {
                    clientId: this.clientId,
                    clientState: this.clientState,
                    proofUpgradeClient: this.proofUpgradeClient,
                    proofUpgradeConsensusState: this.proofUpgradeConsensusState,
                    signer: this.signer,
                },
            };
        }

        /**
         * Returns an instance of IBC.MsgUpgradeClient
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgUpgradeClient}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgUpgradeClient {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgUpgradeClientJsonRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.ibc.MsgUpgradeClient) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.ibc.MsgUpgradeClient} but got ${parsedMsg['@type']}`);
            }

            // TODO: The `client_state` value needs to be handled, currently keeping it as `null`
            if (typeof parsedMsg.client_state === 'object' && Object.keys(parsedMsg.client_state).length > 0) {
                throw new Error('IBC MsgUpgradeClient does not support `client_state` decoding.');
            }

            // TODO: The `consensus_state` value needs to be handled, currently keeping it as `null`
            if (typeof parsedMsg.consensus_state === 'object' && Object.keys(parsedMsg.consensus_state).length > 0) {
                throw new Error('IBC MsgUpgradeClient does not support `consensus_state` decoding.');
            }

            return new MsgUpgradeClient({
                clientId: parsedMsg.client_id,
                clientState: null,
                consensusState: null,
                proofUpgradeClient: new Uint8Array(Object.values(parsedMsg.proof_upgrade_client)),
                proofUpgradeConsensusState: new Uint8Array(Object.values(parsedMsg.proof_upgrade_consensus_state)),
                signer: parsedMsg.signer,
            });
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('IBC Module not supported under amino encoding scheme');
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

export type MsgUpgradeClientOptions = {
    clientId: string;

    clientState?: google.protobuf.IAny | null;

    consensusState?: google.protobuf.IAny | null;

    proofUpgradeClient: Uint8Array;

    proofUpgradeConsensusState: Uint8Array;

    signer: string;
};

export interface MsgUpgradeClientJsonRaw {
    '@type': string;
    client_id: string;
    client_state?: any;
    consensus_state?: any;
    proof_upgrade_client: any;
    proof_upgrade_consensus_state: any;
    signer: string;
}
