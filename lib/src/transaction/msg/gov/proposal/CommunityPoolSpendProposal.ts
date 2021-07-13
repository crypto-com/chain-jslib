import ow from 'ow';
import { ICoin } from '../../../../coin/coin';
import { cosmos, google } from '../../../../cosmos/v1beta1/codec';
import { IMsgProposalContent } from '../IMsgProposalContent';
import { InitConfigurations, CroSDK } from '../../../../core/cro';
import { AddressType, validateAddress } from '../../../../utils/address';
import { owCommunityPoolSpendProposalOptions } from '../ow.types';
import { Amount } from '../../bank/msgsend';
import { COSMOS_MSG_TYPEURL } from '../../../common/constants/typeurl';
import { Network } from '../../../../network/network';

export const communityPoolSpendProposal = function (config: InitConfigurations) {
    return class CommunityPoolSpendProposal implements IMsgProposalContent {
        /** CommunityPoolSpendProposal title. */
        public title: string;

        /** CommunityPoolSpendProposal description. */
        public description: string;

        /** CommunityPoolSpendProposal recipient. */
        public recipient: string;

        /** CommunityPoolSpendProposal amount. */
        public amount: ICoin;

        constructor(options: CommunityPoolSpendProposalOptions) {
            ow(options, 'options', owCommunityPoolSpendProposalOptions);

            this.title = options.title;
            this.description = options.description;
            this.recipient = options.recipient;
            this.amount = options.amount;
        }

        /**
         * Returns the proto encoding representation of CommunityPoolSpendProposal
         * @returns {google.protobuf.Any}
         */
        getEncoded(): google.protobuf.Any {
            const convertedAmount = this.amount.toCosmosCoin();

            const communityPoolSpend = {
                title: this.title,
                description: this.description,
                recipient: this.recipient,
                amount: [
                    {
                        denom: convertedAmount.denom,
                        amount: convertedAmount.amount,
                    },
                ],
            };

            const spendProposal = cosmos.distribution.v1beta1.CommunityPoolSpendProposal.create(communityPoolSpend);

            return google.protobuf.Any.create({
                type_url: COSMOS_MSG_TYPEURL.upgrade.CommunityPoolSpendProposal,
                value: cosmos.distribution.v1beta1.CommunityPoolSpendProposal.encode(spendProposal).finish(),
            });
        }

        /**
         * Returns an instance of CommunityPoolSpendProposal
         * @param {string} msgJsonStr
         * @param {Network} network
         * @returns {CommunityPoolSpendProposal}
         */
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): CommunityPoolSpendProposal {
            const parsedMsg = JSON.parse(msgJsonStr) as CommunityPoolSpendProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.upgrade.CommunityPoolSpendProposal) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.upgrade.CommunityPoolSpendProposal} but got ${parsedMsg['@type']}`,
                );
            }
            if (!parsedMsg.amount || parsedMsg.amount.length !== 1) {
                throw new Error('Invalid amount in the Msg.');
            }
            const cro = CroSDK({ network });

            return new CommunityPoolSpendProposal({
                description: parsedMsg.description,
                title: parsedMsg.title,
                recipient: parsedMsg.recipient,
                amount: cro.Coin.fromCustomAmountDenom(parsedMsg.amount[0].amount, parsedMsg.amount[0].denom),
            });
        }

        validate() {
            if (
                !validateAddress({
                    address: this.recipient,
                    network: config.network,
                    type: AddressType.USER,
                })
            ) {
                throw new TypeError('Provided `recipient` doesnt match network selected');
            }
        }
    };
};

export type CommunityPoolSpendProposalOptions = {
    title: string;
    description: string;
    recipient: string;
    amount: ICoin;
};

export interface CommunityPoolSpendProposalRaw {
    '@type': string;
    title: string;
    description: string;
    recipient: string;
    amount: Amount[];
}
