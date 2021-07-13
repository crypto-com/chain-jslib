import ow from 'ow';
import { cosmos, google } from '../../../../cosmos/v1beta1/codec';
import { IMsgProposalContent } from '../IMsgProposalContent';
import { owCancelSoftwareUpgradeProposalOptions } from '../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { Network } from '../../../../network/network';

export const cancelSoftwareUpgradeProposal = function () {
    return class CancelSoftwareUpgradeProposal implements IMsgProposalContent {
        /** CancelSoftwareUpgradeProposal title. */
        public title: string;

        /** CancelSoftwareUpgradeProposal description. */
        public description: string;

        constructor(options: CancelSoftwareUpgradeProposalOptions) {
            ow(options, 'options', owCancelSoftwareUpgradeProposalOptions);

            this.title = options.title;
            this.description = options.description;
        }

        /**
         * Returns an instance of CancelSoftwareUpgradeProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {CancelSoftwareUpgradeProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): CancelSoftwareUpgradeProposal {
            const parsedMsg = JSON.parse(msgJsonStr) as CancelSoftwareUpgradeProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.upgrade.CancelSoftwareUpgradeProposal) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.upgrade.CancelSoftwareUpgradeProposal} but got ${parsedMsg['@type']}`,
                );
            }

            return new CancelSoftwareUpgradeProposal({
                description: parsedMsg.description,
                title: parsedMsg.title,
            });
        }

        /**
         * Returns the proto encoding representation of CancelSoftwareUpgradeProposal
         * @returns {google.protobuf.Any}
         */
        getEncoded(): google.protobuf.Any {
            const cancelProposalOptions = {
                title: this.title,
                description: this.description,
            };

            const cancelProposal = cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal.create(cancelProposalOptions);

            return google.protobuf.Any.create({
                type_url: COSMOS_MSG_TYPEURL.upgrade.CancelSoftwareUpgradeProposal,
                value: cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal.encode(cancelProposal).finish(),
            });
        }
    };
};

export type CancelSoftwareUpgradeProposalOptions = {
    title: string;
    description: string;
};

interface CancelSoftwareUpgradeProposalRaw {
    '@type': string;
    title: string;
    description: string;
}
