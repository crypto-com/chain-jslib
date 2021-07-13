import ow from 'ow';
import { cosmos, google } from '../../../../cosmos/v1beta1/codec';
import { IMsgProposalContent } from '../IMsgProposalContent';
import { owTextProposalOptions } from '../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { Network } from '../../../../network/network';

export const textProposal = function () {
    return class TextProposal implements IMsgProposalContent {
        /** TextProposal title. */
        public title: string;

        /** TextProposal description. */
        public description: string;

        constructor(options: TextProposalOptions) {
            ow(options, 'options', owTextProposalOptions);

            this.title = options.title;
            this.description = options.description;
        }

        /**
         * Returns an instance of TextProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {TextProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): TextProposal {
            const parsedMsg = JSON.parse(msgJsonStr) as TextProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.gov.TextProposal) {
                throw new Error(`Expected ${COSMOS_MSG_TYPEURL.gov.TextProposal} but got ${parsedMsg['@type']}`);
            }

            return new TextProposal({
                description: parsedMsg.description,
                title: parsedMsg.title,
            });
        }

        /**
         * Returns the proto encoding representation of TextProposal
         * @returns {google.protobuf.Any}
         */
        getEncoded(): google.protobuf.Any {
            const textProposalOptions = {
                title: this.title,
                description: this.description,
            };

            const textProposalProto = cosmos.gov.v1beta1.TextProposal.create(textProposalOptions);

            return google.protobuf.Any.create({
                type_url: COSMOS_MSG_TYPEURL.gov.TextProposal,
                value: cosmos.gov.v1beta1.TextProposal.encode(textProposalProto).finish(),
            });
        }
    };
};

export type TextProposalOptions = {
    title: string;
    description: string;
};

interface TextProposalRaw {
    '@type': string;
    title: string;
    description: string;
}
