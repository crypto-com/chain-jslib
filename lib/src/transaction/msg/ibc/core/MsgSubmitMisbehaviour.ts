/* eslint-disable camelcase */
import ow from 'ow';
import { google } from '../../../../cosmos/v1beta1/codec/generated/codecimpl';
import { InitConfigurations } from '../../../../core/cro';
import { CosmosMsg } from '../../cosmosMsg';
import { Msg } from '../../../../cosmos/v1beta1/types/msg';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { validateAddress, AddressType } from '../../../../utils/address';
import { owMsgSubmitMisbehaviourOptions } from '../../ow.types';
import * as legacyAmino from '../../../../cosmos/amino';
import { Network } from '../../../../network/network';

export const msgSubmitMisbehaviourIBC = function (config: InitConfigurations) {
    return class MsgSubmitMisbehaviour implements CosmosMsg {
        /** MsgSubmitMisbehaviour clientId. */
        public clientId: string;

        /** MsgSubmitMisbehaviour misbehaviour. */
        public misbehaviour?: google.protobuf.IAny | null;

        /** MsgSubmitMisbehaviour signer. */
        public signer: string;

        /**
         * Constructor to create a new IBC.MsgSubmitMisbehaviour
         * @param {MsgSubmitMisbehaviourOptions} options
         * @returns {MsgSubmitMisbehaviour}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgSubmitMisbehaviourOptions) {
            ow(options, 'options', owMsgSubmitMisbehaviourOptions);
            this.clientId = options.clientId;
            this.misbehaviour = options.misbehaviour;
            this.signer = options.signer;
            this.validateAddresses();
        }

        /**
         * Returns the raw Msg representation of Ibc.MsgSubmitMisbehaviour
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.ibc.MsgSubmitMisbehaviour,
                value: {
                    clientId: this.clientId,
                    misbehaviour: this.misbehaviour,
                    signer: this.signer,
                },
            };
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            throw new Error('IBC Module not supported under amino encoding scheme');
        }

        /**
         * Returns an instance of IBC.MsgSubmitMisbehaviour
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgSubmitMisbehaviour}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgSubmitMisbehaviour {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgSubmitMisbehaviourJsonRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.ibc.MsgSubmitMisbehaviour) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.ibc.MsgSubmitMisbehaviour} but got ${parsedMsg['@type']}`,
                );
            }

            // TODO: The `misbehaviour` value needs to be handled, currently keeping it as `null`
            if (typeof parsedMsg.misbehaviour === 'object' && Object.keys(parsedMsg.misbehaviour).length > 0) {
                throw new Error('IBC MsgSubmitMisbehaviour does not support `misbehaviour` decoding.');
            }

            return new MsgSubmitMisbehaviour({
                clientId: parsedMsg.client_id,
                misbehaviour: null,
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

export type MsgSubmitMisbehaviourOptions = {
    clientId: string;
    misbehaviour?: google.protobuf.IAny | null;
    signer: string;
};

export interface MsgSubmitMisbehaviourJsonRaw {
    '@type': string;
    client_id: string;
    misbehaviour?: any;
    signer: string;
}
