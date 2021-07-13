/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { owMsgMintNFTOptions } from '../ow.types';
import { InitConfigurations } from '../../../core/cro';
import { AddressType, validateAddress } from '../../../utils/address';
import { CosmosMsg } from '../cosmosMsg';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export const msgMintNFT = function (config: InitConfigurations) {
    return class MsgMintNFT implements CosmosMsg {
        /** MsgMintNFT id. */
        public id: string;

        /** MsgMintNFT denomId. */
        public denomId: string;

        /** MsgMintNFT name. */
        public name: string;

        /** MsgMintNFT uri. */
        public uri: string;

        /** MsgMintNFT data. */
        public data: string;

        /** MsgMintNFT sender. */
        public sender: string;

        /** MsgMintNFT recipient. */
        public recipient: string;

        /**
         * Constructor to create a new MsgMintNFT
         * @param {MsgMintNFTOptions} options
         * @returns {MsgMintNFT}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgMintNFTOptions) {
            ow(options, 'options', owMsgMintNFTOptions);
            this.id = options.id;
            this.name = options.name;
            this.sender = options.sender;
            this.denomId = options.denomId;
            this.uri = options.uri;
            this.data = options.data;
            this.recipient = options.recipient;

            this.validateAddresses();
        }

        /**
         * Returns the raw Msg representation of MsgMintNFT
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.nft.MsgMintNFT,
                value: {
                    id: this.id,
                    name: this.name,
                    sender: this.sender,
                    denomId: this.denomId,
                    uri: this.uri,
                    data: this.data,
                    recipient: this.recipient,
                },
            };
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'chainmain/nft/MsgMintNFT',
                value: {
                    id: this.id,
                    name: this.name,
                    sender: this.sender,
                    denom_id: this.denomId,
                    uri: this.uri,
                    data: this.data,
                    recipient: this.recipient,
                },
            } as legacyAmino.MsgMintNFT;
        }

        /**
         * Returns an instance of MsgMintNFT
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgMintNFT}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgMintNFT {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgMintNFTRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.nft.MsgMintNFT) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.nft.MsgMintNFT} but got ${parsedMsg['@type']}`);
            }

            return new MsgMintNFT({
                id: parsedMsg.id,
                name: parsedMsg.name,
                sender: parsedMsg.sender,
                denomId: parsedMsg.denom_id,
                recipient: parsedMsg.recipient,
                uri: parsedMsg.uri,
                data: parsedMsg.data,
            });
        }

        validateAddresses() {
            if (
                !validateAddress({
                    address: this.sender,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `sender` does not match network selected');
            }

            if (
                !validateAddress({
                    address: this.recipient,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `recipient` does not match network selected');
            }
        }
    };
};

export type MsgMintNFTOptions = {
    id: string;
    denomId: string;
    name: string;
    uri: string;
    data: string;
    sender: string;
    recipient: string;
};
export interface MsgMintNFTRaw {
    '@type': string;
    id: string;
    denom_id: string;
    name: string;
    uri: string;
    data: string;
    sender: string;
    recipient: string;
}
