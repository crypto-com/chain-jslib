/* eslint-disable camelcase */
import ow from 'ow';
import Long from 'long';
import { cosmos, google } from '../../../../cosmos/v1beta1/codec';
import { IMsgProposalContent } from '../IMsgProposalContent';
import { owSoftwareUpgradeProposalOptions } from '../ow.types';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { Network } from '../../../../network/network';

export const softwareUpgradeProposal = function () {
    return class SoftwareUpgradeProposal implements IMsgProposalContent {
        /** SoftwareUpgradeProposal title. */
        public title: string;

        /** SoftwareUpgradeProposal description. */
        public description: string;

        /** SoftwareUpgradeProposal plan. */
        public plan?: IPlan;

        constructor(options: SoftwareUpgradeProposalOptions) {
            ow(options, 'options', owSoftwareUpgradeProposalOptions);

            this.title = options.title;
            this.description = options.description;
            this.plan = options.plan;
        }

        /**
         * Returns an instance of SoftwareUpgradeProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {SoftwareUpgradeProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, _network: Network): SoftwareUpgradeProposal {
            const parsedMsg = JSON.parse(msgJsonStr) as SoftwareUpgradeProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.upgrade.SoftwareUpgradeProposal) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.upgrade.SoftwareUpgradeProposal} but got ${parsedMsg['@type']}`,
                );
            }

            const { plan } = parsedMsg;

            let timeSecondsLong;
            let timeNanos;

            // Plan time checks
            if (plan.time) {
                if (plan.time.seconds) {
                    timeSecondsLong = Long.fromString(plan.time.seconds, true, 10);
                }
                if (plan.time.nanos) {
                    timeNanos = Number(plan.time.nanos);
                }
            }

            // Plan height checks
            if (!plan.height) {
                throw new Error('Invalid `height` attribute in Plan.');
            }

            // Plan `upgradedClientState` checks
            // TODO: check for any live example (if any), keeping empty `value` now
            let upgradedClientState;
            if (plan.upgraded_client_state && Object.keys(plan.upgraded_client_state).length > 0) {
                upgradedClientState = google.protobuf.Any.create({
                    type_url: plan.upgraded_client_state?.type_url,
                    value: new Uint8Array(),
                });
            }

            return new SoftwareUpgradeProposal({
                description: parsedMsg.description,
                title: parsedMsg.title,
                plan: {
                    height: Long.fromString(plan.height, true, 10),
                    info: plan.info,
                    name: plan.name,
                    time: {
                        nanos: timeNanos,
                        seconds: timeSecondsLong,
                    },
                    upgradedClientState,
                },
            });
        }

        /**
         * Returns the proto encoding representation of SoftwareUpgradeProposal
         * @returns {google.protobuf.Any}
         */
        getEncoded(): google.protobuf.Any {
            const softwareUpgradeProposalOptions = {
                title: this.title,
                description: this.description,
                plan: this.plan,
            };

            const softwareUpgradeProposalContent = cosmos.upgrade.v1beta1.SoftwareUpgradeProposal.create(
                softwareUpgradeProposalOptions,
            );

            return google.protobuf.Any.create({
                type_url: COSMOS_MSG_TYPEURL.upgrade.SoftwareUpgradeProposal,
                value: cosmos.upgrade.v1beta1.SoftwareUpgradeProposal.encode(softwareUpgradeProposalContent).finish(),
            });
        }
    };
};

export type IPlan = {
    /** Plan name */
    name: string;

    /** Plan time */
    time?: ITimestamp;

    /** Plan height */
    height: Long;

    /** Plan info */
    info: string;

    /** Plan upgradedClientState */
    upgradedClientState?: google.protobuf.IAny;
};

export type ITimestamp = {
    /** Timestamp seconds */
    seconds?: Long;

    /** Timestamp nanos */
    nanos?: number;
};

export type SoftwareUpgradeProposalOptions = {
    title: string;
    description: string;
    plan?: IPlan;
};

interface SoftwareUpgradeProposalRaw {
    '@type': string;
    title: string;
    description: string;
    plan: PlanRaw;
}
interface PlanRaw {
    name: string;
    time?: {
        seconds?: string;
        nanos?: number;
    };
    height: string;
    info: string;
    upgraded_client_state?: { type_url: string; value: any };
}
