/* eslint-disable camelcase */
import ow from 'ow';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { owMsgTransferNFTOptions } from '../ow.types';
import { InitConfigurations } from '../../../core/cro';
import { AddressType, validateAddress } from '../../../utils/address';
import { CosmosMsg } from '../cosmosMsg';
import { COSMOS_MSG_TYPEURL } from '../../common/constants/typeurl';
import * as legacyAmino from '../../../cosmos/amino';
import { Network } from '../../../network/network';

export const msgTransferNFT = function (config: InitConfigurations) {
    return class MsgTransferNFT implements CosmosMsg {
        /** MsgTransferNFT id. */
        public id: string;

        /** MsgTransferNFT denomId. */
        public denomId: string;

        /** MsgTransferNFT sender. */
        public sender: string;

        /** MsgTransferNFT recipient. */
        public recipient: string;

        /**
         * Constructor to create a new MsgTransferNFT
         * @param {MsgTransferNFTOptions} options
         * @returns {MsgTransferNFT}
         * @throws {Error} when options is invalid
         */
        constructor(options: MsgTransferNFTOptions) {
            ow(options, 'options', owMsgTransferNFTOptions);

            this.id = options.id;
            this.sender = options.sender;
            this.denomId = options.denomId;
            this.recipient = options.recipient;

            this.validateAddresses();
        }

        /**
         * Returns the raw Msg representation of MsgTransferNFT
         * @returns {Msg}
         */
        toRawMsg(): Msg {
            return {
                typeUrl: COSMOS_MSG_TYPEURL.nft.MsgTransferNFT,
                value: {
                    id: this.id,
                    sender: this.sender,
                    denomId: this.denomId,
                    recipient: this.recipient,
                } as MsgTransferNFTOptions,
            };
        }

        // eslint-disable-next-line class-methods-use-this
        toRawAminoMsg(): legacyAmino.Msg {
            return {
                type: 'chainmain/nft/MsgTransferNFT',
                value: {
                    id: this.id,
                    sender: this.sender,
                    denom_id: this.denomId,
                    recipient: this.recipient,
                },
            } as legacyAmino.MsgTransferNFT;
        }

        /**
         * Returns an instance of MsgTransferNFT
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {MsgTransferNFT}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): MsgTransferNFT {
            const parsedMsg = JSON.parse(msgJsonStr) as MsgTransferNFTRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.nft.MsgTransferNFT) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.nft.MsgTransferNFT} but got ${parsedMsg['@type']}`);
            }

            return new MsgTransferNFT({
                id: parsedMsg.id,
                sender: parsedMsg.sender,
                denomId: parsedMsg.denom_id,
                recipient: parsedMsg.recipient,
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

export type MsgTransferNFTOptions = {
    id: string;
    denomId: string;
    sender: string;
    recipient: string;
};
export type MsgTransferNFTRaw = {
    '@type': string;
    id: string;
    denom_id: string;
    sender: string;
    recipient: string;
};
