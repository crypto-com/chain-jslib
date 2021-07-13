import Long from 'long';
import { TxBody } from '../../../cosmos/v1beta1/types/tx';
import { Bytes } from '../../bytes/bytes';
import { google, cosmos } from '../../../cosmos/v1beta1/codec';
import { Msg } from '../../../cosmos/v1beta1/types/msg';
import { typeUrlMappings } from '../../../cosmos/v1beta1/types/typeurls';

/**
 * Encode TxBody to protobuf binary
 */
export const protoEncodeTxBody = (txBody: TxBody): Bytes => {
    const wrappedMessages = txBody.value.messages.map((message) => {
        const rawMessage = message.toRawMsg();
        const messageBytes = protoEncodeTxBodyMessage(rawMessage);
        return google.protobuf.Any.create({
            type_url: rawMessage.typeUrl,
            value: messageBytes,
        });
    });
    const txBodyProto = cosmos.tx.v1beta1.TxBody.create({
        ...txBody,
        messages: wrappedMessages,
    });

    if (txBody.value.memo) {
        txBodyProto.memo = txBody.value.memo;
    }

    if (txBody.value.timeoutHeight && txBody.value.timeoutHeight !== '0') {
        txBodyProto.timeoutHeight = Long.fromString(txBody.value.timeoutHeight, true);
    }
    return Bytes.fromUint8Array(cosmos.tx.v1beta1.TxBody.encode(txBodyProto).finish());
};

/**
 * Encode TxBody message to protobuf binary
 */
const protoEncodeTxBodyMessage = (message: Msg): Uint8Array => {
    const type = typeUrlMappings[message.typeUrl];
    if (!type) {
        throw new Error(`Unrecognized message type ${message.typeUrl}`);
    }
    const created = type.create(message.value);
    return Uint8Array.from(type.encode(created).finish());
};
