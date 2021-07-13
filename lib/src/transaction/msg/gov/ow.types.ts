import ow from 'ow';
import Long from 'long';
import { owStrictObject, owOptionalStrictObject } from '../../../ow.types';
import { owCoin } from '../../../coin/ow.types';

export const owCommunityPoolSpendProposalOptions = owStrictObject().exactShape({
    title: ow.string,
    description: ow.string,
    recipient: ow.string,
    amount: owCoin(),
});

export const owParamChange = () =>
    owStrictObject().exactShape({
        subspace: ow.string,
        key: ow.string,
        value: ow.string,
    });

export const owParamChangeProposalOptions = owStrictObject().exactShape({
    title: ow.string,
    description: ow.string,
    paramChanges: ow.array.ofType(owParamChange()),
});

export const owCancelSoftwareUpgradeProposalOptions = owStrictObject().exactShape({
    title: ow.string,
    description: ow.string,
});

export const owTextProposalOptions = owStrictObject().exactShape({
    title: ow.string,
    description: ow.string,
});

const owLongValidator = (val: object) => ({
    validator: val instanceof Long,
    message: (label: string) => `Expected ${label} to be an instance of \`Long\``,
});
export const owLong = () => owStrictObject().validate(owLongValidator);
export const owOptionalLong = () => owOptionalStrictObject().validate(owLongValidator);

export const owOptionalAny = () =>
    owOptionalStrictObject().exactShape({
        typeUrl: ow.string,
        value: ow.uint8Array,
    });

export const owOptionalTimestamp = () =>
    owOptionalStrictObject().exactShape({
        seconds: owOptionalLong(),
        nanos: ow.optional.number,
    });
export const owSoftwareUpgradeProposalOptions = owStrictObject().exactShape({
    title: ow.string,
    description: ow.string,
    plan: ow.optional.object.exactShape({
        name: ow.string,
        time: owOptionalTimestamp(),
        height: owLong(),
        info: ow.string,
        upgradedClientState: owOptionalAny(),
    }),
});
