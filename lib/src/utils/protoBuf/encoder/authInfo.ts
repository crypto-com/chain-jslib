import Long from 'long';
import { AuthInfo } from '../../../cosmos/v1beta1/types/tx';
import { cosmos, google } from '../../../cosmos/v1beta1/codec';
import { Bytes } from '../../bytes/bytes';
import { DEFAULT_GAS_LIMIT } from '../../../transaction/signable';

/**
 * Encode AuthInfo message to protobuf binary
 */
export const protoEncodeAuthInfo = (authInfo: AuthInfo): Bytes => {
    const encodableAuthInfo: cosmos.tx.v1beta1.IAuthInfo = {
        signerInfos: authInfo.signerInfos.map(
            ({ publicKey, modeInfo, sequence }): cosmos.tx.v1beta1.ISignerInfo => ({
                publicKey: protoEncodePubKey(publicKey),
                modeInfo,
                sequence: sequence ? Long.fromString(sequence.toString()) : undefined,
            }),
        ),
        fee: {
            amount:
                authInfo.fee.amount !== undefined
                    ? authInfo.fee.amount.map((feeAmount) => feeAmount.toCosmosCoin())
                    : [],
            gasLimit: protoEncodeGasLimitOrDefault(authInfo),
        },
    };
    return Bytes.fromUint8Array(cosmos.tx.v1beta1.AuthInfo.encode(encodableAuthInfo).finish());
};

const protoEncodeGasLimitOrDefault = (authInfo: AuthInfo): Long.Long => {
    const defaultGasLimit = Long.fromNumber(DEFAULT_GAS_LIMIT);
    return authInfo.fee.gasLimit !== undefined && authInfo.fee.gasLimit !== null
        ? Long.fromNumber(authInfo.fee.gasLimit.toNumber())
        : defaultGasLimit;
};

/**
 * Encode public key to protobuf Any JS structure
 */
const protoEncodePubKey = (pubKey: Bytes): google.protobuf.IAny => {
    const pubKeyProto = cosmos.crypto.secp256k1.PubKey.create({
        key: pubKey.toUint8Array(),
    });
    return google.protobuf.Any.create({
        type_url: '/cosmos.crypto.secp256k1.PubKey',
        value: Uint8Array.from(cosmos.crypto.secp256k1.PubKey.encode(pubKeyProto).finish()),
    });
};
