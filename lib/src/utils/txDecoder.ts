import { Registry } from '@cosmjs/proto-signing';
import { toBase64, fromBase64 } from '@cosmjs/encoding';
import { AuthInfo, TxBody, SignerInfo, Tx } from '@cosmjs/proto-signing/build/codec/cosmos/tx/v1beta1/tx';
import * as snakecaseKeys from 'snakecase-keys';
import Long from 'long';
import { cosmos } from '../cosmos/v1beta1/codec/generated/codecimpl';
import { Bytes } from './bytes/bytes';
import { typeUrlMappings } from '../cosmos/v1beta1/types/typeurls';
import { SIGN_MODE } from '../transaction/types';

const cosmJSRegistry = new Registry(Object.entries(typeUrlMappings));

export class TxDecoder {
    private libDecodedTxBody!: TxBody;

    private libDecodedAuthInfo!: AuthInfo;

    private libDecodedSignatures!: Uint8Array[];

    /**
     * Creates TxDecoder instance
     * @constructor
     */
    constructor() {
        this.libDecodedTxBody = Object.create({});
        this.libDecodedAuthInfo = Object.create({});
        this.libDecodedSignatures = Object.create([]);
    }

    private assertHex = (h: string) => {
        const re = /^[a-fA-F0-9]+$/;
        if (!re.test(h)) {
            throw new TypeError('Invalid Hex provided.');
        }
    };

    /**
     * @name fromHex()
     * @param txHex
     * @returns TxDecoder
     */
    public fromHex(txHex: string): TxDecoder {
        if (!txHex) {
            throw new TypeError(`Received malformed transaction hex.`);
        }
        this.assertHex(txHex);
        const sanitisedTxHex = Bytes.clean0x(txHex);
        try {
            const encodedTxBytes = Bytes.fromHexString(sanitisedTxHex).toUint8Array();
            const libDecodedTx = Tx.decode(encodedTxBytes);
            this.libDecodedSignatures = libDecodedTx.signatures;
            this.libDecodedAuthInfo = libDecodedTx.authInfo!;

            // Deep decoding for TxBody below
            this.libDecodedTxBody = libDecodedTx.body!;
            return this;
        } catch (error) {
            throw new TypeError(`Error decoding provided transaction hex.`);
        }
    }

    /**
     * Returns CosmosSDK compatible JSON encoded transaction
     * @name toCosmosJSON()
     * @returns {string}
     */
    public toCosmosJSON() {
        const txObject = {
            body: Object.create({}),
            authInfo: Object.create({}),
            signatures: Object.create([[]]),
        };

        txObject.body = getTxBodyJson(this.libDecodedTxBody);
        txObject.signatures = getSignaturesJson(this.libDecodedSignatures);
        txObject.authInfo = getAuthInfoJson(this.libDecodedAuthInfo);

        const stringifiedTx = JSON.stringify(snakecaseKeys.default(txObject));

        const cosmosApiFormatTxJson = typeUrlToCosmosTransformer(stringifiedTx);

        return cosmosApiFormatTxJson;
    }
}
export const getSignerInfoJson = (signerInfo: SignerInfo) => {
    const stringifiedSignerInfo = JSON.stringify(SignerInfo.toJSON(signerInfo) as any);
    const libParsedSignerInfo = JSON.parse(stringifiedSignerInfo);
    const decodedPubkey: cosmos.crypto.ed25519.PubKey | cosmos.crypto.secp256k1.PubKey = cosmJSRegistry.decode({
        typeUrl: libParsedSignerInfo.publicKey?.typeUrl!,
        value: fromBase64(libParsedSignerInfo.publicKey?.value!),
    });

    const obj = { ...libParsedSignerInfo };
    obj.publicKey = { typeUrl: libParsedSignerInfo.publicKey?.typeUrl!, key: toBase64(decodedPubkey.key) };

    return obj;
};

export const getSignaturesJson = (signaturesArray: Uint8Array[]): string[] => {
    let signatures: string[] = [];
    // Adding Signatures array to final object
    if (signaturesArray) {
        signatures = signaturesArray.map((e) => toBase64(typeof e !== typeof undefined ? e : new Uint8Array()));
    }
    return signatures;
};

export const getTxBodyJson = (txBody: TxBody) => {
    const txBodyStringified = JSON.stringify(TxBody.toJSON(txBody));
    const parsedTxBody = JSON.parse(txBodyStringified);
    const obj = { ...parsedTxBody };
    obj.messages = txBody.messages.map(({ typeUrl, value }) => {
        return decodeAnyType(typeUrl, value);
    });
    return obj;
};

function decodeAnyType(typeUrl: string, value: Uint8Array) {
    if (!typeUrl) {
        throw new Error('Missing type_url in Any');
    }
    if (!value) {
        throw new Error('Missing value in Any');
    }
    const decodedParams = cosmJSRegistry.decode({ typeUrl, value });
    handleCustomTypes(decodedParams);
    const finalDecodedParams = handleSpecialParams(decodedParams);
    return { typeUrl, ...finalDecodedParams };
}

function handleSpecialParams(decodedParams: any) {
    // handle all `MsgSubmitProposal` related messages
    const clonedDecodedParams = { ...decodedParams };
    if (decodedParams.content && Object.keys(decodedParams.content).length !== 0) {
        clonedDecodedParams.content = decodeAnyType(decodedParams.content.type_url, decodedParams.content.value);
    }
    return clonedDecodedParams;
}

export const getAuthInfoJson = (authInfo: AuthInfo) => {
    const authInfoStringified = JSON.stringify(AuthInfo.toJSON(authInfo));

    const libParsedAuthInfo = JSON.parse(authInfoStringified);
    const obj = { ...libParsedAuthInfo };

    if (authInfo.signerInfos) {
        obj.signerInfos = authInfo.signerInfos.map((e) =>
            typeof e !== typeof undefined ? getSignerInfoJson(e) : undefined,
        );
    } else {
        obj.signerInfos = [];
    }

    return obj;
};

// transforms `type_url` to `@type` to match GoLang's TxDecoder JSON output
export const typeUrlToCosmosTransformer = (str: string) => str.replace(/type_url/g, '@type');

export const getTxBodyBytes = (txBody: TxBody): Bytes => {
    try {
        return Bytes.fromUint8Array(TxBody.encode(txBody).finish());
    } catch (error) {
        throw new Error('Error getting TxBody bytes');
    }
};

export const getSignModeFromLibDecodedSignMode = (signModeNumber: number) => {
    switch (signModeNumber) {
        case SIGN_MODE.DIRECT:
            return SIGN_MODE.DIRECT;
        case SIGN_MODE.LEGACY_AMINO_JSON:
            return SIGN_MODE.LEGACY_AMINO_JSON;
        default:
            throw new Error(`Received Sign Mode ${signModeNumber} not supported`);
    }
};

const handleCustomTypes = (obj: any) => {
    Object.keys(obj).forEach((k) => {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            if (obj[k] instanceof Long) {
                // Recursively keeping same object
                obj[k] = obj[k].toString(10); // eslint-disable-line no-param-reassign
            }
            handleCustomTypes(obj[k]);
        }
    });
};
