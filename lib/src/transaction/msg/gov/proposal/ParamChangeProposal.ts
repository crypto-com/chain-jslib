import ow from 'ow';
import { cosmos, google } from '../../../../cosmos/v1beta1/codec';
import { IMsgProposalContent } from '../IMsgProposalContent';
import { owParamChangeProposalOptions } from '../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { Network } from '../../../../network/network';

export const paramChangeProposal = function () {
    return class ParamChangeProposal implements IMsgProposalContent {
        /** ParameterChangeProposal title. */
        public readonly title: string;

        /** ParameterChangeProposal description. */
        public readonly description: string;

        public readonly paramChanges: ParamChange[];

        constructor(options: ParamChangeProposalOptions) {
            ow(options, 'options', owParamChangeProposalOptions);

            this.title = options.title;
            this.description = options.description;
            this.paramChanges = options.paramChanges;
        }

        /**
         * Returns the proto encoding representation of CommunityPoolSpendProposal
         * @returns {google.protobuf.Any}
         */
        getEncoded(): google.protobuf.Any {
            const parameterChanges = this.paramChanges.map((param) =>
                cosmos.params.v1beta1.ParamChange.create({
                    subspace: param.subspace,
                    key: param.key,
                    value: param.value,
                }),
            );
            const paramChange = {
                title: this.title,
                description: this.description,
                changes: parameterChanges,
            };

            const spendProposal = cosmos.params.v1beta1.ParameterChangeProposal.create(paramChange);

            return google.protobuf.Any.create({
                type_url: COSMOS_MSG_TYPEURL.upgrade.ParameterChangeProposal,
                value: cosmos.params.v1beta1.ParameterChangeProposal.encode(spendProposal).finish(),
            });
        }

        /**
         * Returns an instance of ParamChangeProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {ParamChangeProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): ParamChangeProposal {
            const parsedMsg = JSON.parse(msgJsonStr) as ParamChangeProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.upgrade.ParameterChangeProposal) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.upgrade.ParameterChangeProposal} but got ${parsedMsg['@type']}`,
                );
            }

            return new ParamChangeProposal({
                description: parsedMsg.description,
                title: parsedMsg.title,
                paramChanges: parsedMsg.changes,
            });
        }
    };
};

export type ParamChange = {
    /** ParamChange subspace. */
    subspace: string;

    /** ParamChange key. */
    key: string;

    /** ParamChange value. */
    value: string;
};

export type ParamChangeProposalOptions = {
    title: string;
    description: string;
    paramChanges: ParamChange[];
};

export interface ParamChangeProposalRaw {
    '@type': string;
    changes: ParamChange[];
    title: string;
    description: string;
}
