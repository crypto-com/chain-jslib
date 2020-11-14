// Copyright © 2018–2020 IOV SAS (licensed under the Apache License, Version 2.0)
// Copyright © 2020 Confio UO (licensed under the Apache License, Version 2.0)
// Copyright © 2020 Simon Warta (licensed under the Apache License, Version 2.0)
// Modifications Copyright (c) 2018 - 2020, Foris Limited (licensed under the Apache License, Version 2.0)
import protobuf from 'protobufjs';
import { cosmos } from '../codec';

export const typeUrlMappings: {
    [key: string]: GeneratedType;
} = {
    '/cosmos.base.v1beta1.Coin': cosmos.base.v1beta1.Coin,
    '/cosmos.bank.v1beta1.MsgSend': cosmos.bank.v1beta1.MsgSend,
    '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward': cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward,
    '/cosmos.staking.v1beta1.MsgCreateValidator': cosmos.staking.v1beta1.MsgCreateValidator,
    '/cosmos.staking.v1beta1.MsgBeginRedelegate': cosmos.staking.v1beta1.MsgBeginRedelegate,
    '/cosmos.staking.v1beta1.MsgEditValidator': cosmos.staking.v1beta1.MsgEditValidator,
    '/cosmos.staking.v1beta1.MsgDelegate': cosmos.staking.v1beta1.MsgDelegate,
    '/cosmos.staking.v1beta1.MsgUndelegate': cosmos.staking.v1beta1.MsgUndelegate,
    '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission':
        cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission,
    '/cosmos.crypto.ed25519.PubKey': cosmos.crypto.ed25519.PubKey,
};

export interface GeneratedType {
    readonly create: (properties?: { [k: string]: any }) => any;
    readonly encode: (message: any | { [k: string]: any }, writer?: protobuf.Writer) => protobuf.Writer;
    readonly decode: (reader: protobuf.Reader | Uint8Array, length?: number) => any;
}
