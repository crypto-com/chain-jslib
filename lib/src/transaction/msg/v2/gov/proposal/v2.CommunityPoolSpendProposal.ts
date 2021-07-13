import ow from 'ow';
import { v2 } from '../../../ow.types';
import { InitConfigurations, CroSDK } from '../../../../../core/cro';
import { IMsgProposalContent } from '../../../gov/IMsgProposalContent';
import { ICoin } from '../../../../../coin/coin';
import { google, cosmos } from '../../../../../cosmos/v1beta1/codec';
import { COSMOS_MSG_TYPEURL } from '../../../../common/constants/typeurl';
import { Network } from '../../../../../network/network';
import { validateAddress, AddressType } from '../../../../../utils/address';
import { Amount } from '../../../bank/msgsend';

export const communityPoolSpendProposalV2 = function (config: InitConfigurations) {
    return class CommunityPoolSpendProposalV2 implements IMsgProposalContent {
        /** CommunityPoolSpendProposal title. */
        public title: string;

        /** CommunityPoolSpendProposal description. */
        public description: string;

        /** CommunityPoolSpendProposal recipient. */
        public recipient: string;

        /** CommunityPoolSpendProposal amount. */
        public amount: ICoin[];

        constructor(options: CommunityPoolSpendProposalOptions) {
            ow(options, 'options', v2.owCommunityPoolSpendProposalOptions);

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
            const communityPoolSpend = {
                title: this.title,
                description: this.description,
                recipient: this.recipient,
                amount: this.amount.map((coin) => coin.toCosmosCoin()),
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
        public static fromCosmosMsgJSON(msgJsonStr: string, network: Network): CommunityPoolSpendProposalV2 {
            const parsedMsg = JSON.parse(msgJsonStr) as CommunityPoolSpendProposalRaw;
            if (parsedMsg['@type'] !== COSMOS_MSG_TYPEURL.upgrade.CommunityPoolSpendProposal) {
                throw new Error(
                    `Expected ${COSMOS_MSG_TYPEURL.upgrade.CommunityPoolSpendProposal} but got ${parsedMsg['@type']}`,
                );
            }
            if (!parsedMsg.amount || parsedMsg.amount.length < 1) {
                throw new Error('Invalid amount in the Msg.');
            }
            const cro = CroSDK({ network });

            return new CommunityPoolSpendProposalV2({
                description: parsedMsg.description,
                title: parsedMsg.title,
                recipient: parsedMsg.recipient,
                amount: parsedMsg.amount.map((coin) => cro.Coin.fromCustomAmountDenom(coin.amount, coin.denom)),
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
    amount: ICoin[];
};

export interface CommunityPoolSpendProposalRaw {
    '@type': string;
    title: string;
    description: string;
    recipient: string;
    amount: Amount[];
}
