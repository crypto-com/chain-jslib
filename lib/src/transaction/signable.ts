// Copyright © 2018–2020 IOV SAS (licensed under the Apache License, Version 2.0)
// Copyright © 2020 Confio UO (licensed under the Apache License, Version 2.0)
// Copyright © 2020 Simon Warta (licensed under the Apache License, Version 2.0)
// Modifications Copyright (c) 2018 - 2020, Foris Limited (licensed under the Apache License, Version 2.0)
import Big from 'big.js';
import ow, { NumberPredicate } from 'ow';
import Long from 'long';
import secp256k1 from 'secp256k1';

import {
    AuthInfo as NativeAuthInfo,
    TxBody as NativeTxbody,
} from '@cosmjs/proto-signing/build/codec/cosmos/tx/v1beta1/tx';
import * as snakecaseKeys from 'snakecase-keys';
import { cosmos } from '../cosmos/v1beta1/codec';
import { omitDefaults } from '../cosmos/v1beta1/adr27';
import { AuthInfo, SignerInfo, TxBody, TxRaw } from '../cosmos/v1beta1/types/tx';
import { sha256 } from '../utils/hash';
import { Network } from '../network/network';
import { Bytes } from '../utils/bytes/bytes';
import { EMPTY_SIGNATURE, SignerAccount, SIGN_MODE } from './types';
import { owSignableTransactionParams } from './ow.types';
import { owBytes } from '../utils/bytes/ow.types';
import { SignedTransaction } from './signed';
import * as legacyAmino from '../cosmos/amino';
import { ICoin } from '../coin/coin';
import { CosmosMsg } from './msg/cosmosMsg';
import { typeUrlToCosmosTransformer, getAuthInfoJson, getTxBodyJson, getSignaturesJson } from '../utils/txDecoder';
import { owBig } from '../ow.types';
import { CroSDK } from '../core/cro';
import { CosmosTx } from '../cosmos/v1beta1/types/cosmostx';
import { typeUrlToMsgClassMapping } from './common/constants/typeurl';
import { protoEncodeTxBody } from '../utils/protoBuf/encoder/txBodyMessage';
import { protoEncodeAuthInfo } from '../utils/protoBuf/encoder/authInfo';

export const DEFAULT_GAS_LIMIT = 200_000;

/**
 * SignableTransaction is a prepared transaction ready to be signed
 */
export class SignableTransaction {
    private txRaw: TxRaw;

    public readonly txBody: TxBody = {
        typeUrl: '/cosmos.tx.v1beta1.TxBody',
        value: {
            messages: [],
            memo: '',
            timeoutHeight: '0',
        },
    };

    public readonly authInfo: AuthInfo = {
        signerInfos: [],
        fee: {
            gasLimit: new Big(DEFAULT_GAS_LIMIT),
        },
    };

    private network: Network;

    private signerAccounts: SignerAccount[] = [];

    /**
     * Constructor to create a SignableTransaction
     * @param {SignableTransactionParams} params
     * @returns {SignableTransaction}
     * @throws {Error} when params is invalid or the transaction
     */
    public constructor(params: SignableTransactionParams) {
        ow(params, 'params', owSignableTransactionParams);
        this.network = params.network;

        const cosmosTxDecoded: CosmosTx = JSON.parse(params.rawTxJSON);

        const cosmosObj = cosmosTxDecoded;

        if (!cosmosObj.body) {
            throw new Error('Missing body in Cosmos JSON');
        }
        const { body } = cosmosObj;
        const { memo } = body;
        const timeoutHeight = body.timeout_height;

        if (
            (body.non_critical_extension_options && body.non_critical_extension_options.length > 0) ||
            (body.extension_options && body.extension_options.length > 0)
        ) {
            throw new Error("SignableTransaction doesn't support 'nonCriticalExtensionOptions' or 'extensionOptions'");
        }

        if (!body.messages || body.messages.length < 1) {
            throw new Error('Decoded TxBody does not have valid messages');
        }
        const croSdk = CroSDK({ network: this.getNetwork() });

        const txBody: TxBody = {
            typeUrl: '/cosmos.tx.v1beta1.TxBody',
            value: {
                messages: [],
                memo,
                timeoutHeight,
            },
        };
        body.messages.forEach((message) => {
            const msgClassInstance = typeUrlToMsgClassMapping(croSdk, message['@type']);
            const nativeMsg: CosmosMsg = msgClassInstance.fromCosmosMsgJSON(JSON.stringify(message), this.getNetwork());
            txBody.value.messages.push(nativeMsg);
        });

        if (typeof cosmosObj.auth_info === 'undefined') {
            throw new Error('Decoded Tx does not have a valid `authInfo`');
        }
        const cosmosAuthInfo = cosmosObj.auth_info;
        const cosmosSignerInfos = cosmosAuthInfo.signer_infos;
        const signerInfos: SignerInfo[] = [];

        cosmosSignerInfos.forEach((signerInfo) => {
            // TODO: Support MultiSig in near future
            const publicKeyObj = signerInfo.public_key as any;
            if (!signerInfo.mode_info.single) {
                throw new Error('SignableTransaction only supports single signer mode.');
            }

            const pubKey = publicKeyObj.key;
            let signMode: cosmos.tx.signing.v1beta1.SignMode;
            switch (signerInfo.mode_info.single?.mode) {
                case 'SIGN_MODE_DIRECT':
                    signMode = cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT;
                    break;
                case 'SIGN_MODE_LEGACY_AMINO_JSON':
                    signMode = cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
                    break;
                default:
                    throw new Error(`Unsupported sign mode: ${signerInfo.mode_info.single?.mode}`);
            }

            signerInfos.push({
                publicKey: Bytes.fromBase64String(pubKey),
                modeInfo: {
                    single: {
                        mode: signMode,
                    },
                },
                sequence: new Big(signerInfo.sequence),
            });
        });

        if (typeof cosmosAuthInfo.fee === 'undefined' || typeof cosmosAuthInfo.fee.amount === 'undefined') {
            throw new Error('Decoded Tx AuthInfo does not have a valid `fee`');
        }

        const feeAmountList: ICoin[] = cosmosAuthInfo.fee.amount.map((feeAmount) => {
            const feeAmountString = feeAmount.amount;
            const feeAmountDenom = feeAmount.denom;
            const feeAmountCoin = croSdk.Coin.fromCustomAmountDenom(feeAmountString, feeAmountDenom);
            return feeAmountCoin;
        });

        const authInfo: AuthInfo = {
            signerInfos,
            fee: {
                amount: feeAmountList || undefined,
                gasLimit: new Big(cosmosAuthInfo.fee.gas_limit || DEFAULT_GAS_LIMIT),
                payer: cosmosAuthInfo.fee.payer,
                granter: cosmosAuthInfo.fee.granter,
            },
        };

        if (authInfo.signerInfos.length === 0) {
            throw new TypeError('Expected signer in `signerInfos` of `authInfo` of `params`, got none');
        }

        this.txBody = txBody;
        this.authInfo = authInfo;

        const signatures =
            cosmosObj.signatures.length > 0
                ? cosmosObj.signatures.map((sigStr: string) => {
                      return Bytes.fromBase64String(sigStr);
                  })
                : authInfo.signerInfos.map(() => EMPTY_SIGNATURE);

        const bodyBytes = protoEncodeTxBody(txBody);
        const authInfoBytes = protoEncodeAuthInfo(authInfo);

        // Initialising TxRaw
        this.txRaw = {
            bodyBytes,
            authInfoBytes,
            signatures,
        };
        this.network = params.network;

        // signerAccounts[]: To keep backward compatibility we can import it explicitly as well
        this.signerAccounts = params.signerAccounts || [];
    }

    /**
     * Imports SignerAccounts for the transaction.
     * Note: It must be called before setting signature /converting to `Signed`/Setting AccountNumber
     * @param signerAccounts
     */
    public importSignerAccounts(signerAccounts: SignerAccount[]) {
        this.signerAccounts = signerAccounts;
        return this;
    }

    /**
     * Returns the SignDoc of the specified index before hashing
     * @param {number} index index of the signer
     * @returns {Bytes}
     * @throws {Error} when index is invalid
     * @memberof SignableTransaction
     */
    public toSignDocument(index: number): Bytes {
        ow(index, 'index', this.owIndex());

        const signMode = this.getSignerSignMode(index);
        if (signMode === SIGN_MODE.DIRECT) {
            return makeSignDoc(
                this.txRaw.bodyBytes,
                this.txRaw.authInfoBytes,
                this.network.chainId,
                this.signerAccounts[index].accountNumber,
            );
        }
        if (signMode === SIGN_MODE.LEGACY_AMINO_JSON) {
            return makeLegacyAminoSignDoc(
                legacyEncodeMsgs(this.txBody.value.messages),
                legacyEncodeStdFee(this.authInfo.fee.amount, this.authInfo.fee.gasLimit),
                this.network.chainId,
                this.txBody.value.memo || '',
                this.signerAccounts[index].accountNumber.toString(),
                this.authInfo.signerInfos[index].sequence.toString(),
                legacyEncodeTimeoutHeight(this.txBody.value.timeoutHeight),
            );
        }
        throw new Error(`Unrecognized sign mode: ${signMode}`);
    }

    /**
     * This function manually set the provided accountNumber at a specified index of signerAccountsList
     * @param {number} index index of the signer
     * @param {Big} accountNumber accountNumber to set
     * @throws {Error} when index is invalid
     * @memberof SignableTransaction
     */
    public setSignerAccountNumberAtIndex(index: number, accountNumber: Big): SignableTransaction {
        ow(accountNumber, 'accountNumber', owBig());
        ow(index, 'index', this.owIndex());

        this.signerAccounts[index].accountNumber = accountNumber;
        return this;
    }

    /**
     * Returns the SignDoc Hash of the specified index
     * @param {number} index index of the signer
     * @returns {Bytes} , length is 32 bytes, SHA256 hash
     * @throws {Error} when index is invalid
     * @memberof SignableTransaction
     */
    public toSignDocumentHash(index: number): Bytes {
        const raw = this.toSignDocument(index);
        const hash = sha256(raw);
        return hash;
    }

    /**
     * DEPRECATED WARNING - this function will be deprecated
     * Returns the SignDoc Hash of the specified index
     * @param {number} index index of the signer
     * @returns {Bytes} , length is 32 bytes, SHA256 hash
     * @throws {Error} when index is invalid
     * @memberof SignableTransaction
     */
    public toSignDoc(index: number): Bytes {
        return this.toSignDocumentHash(index);
    }

    /**
     * Set signature of the specified signer index
     * @param {number} index index to set the signature
     * @param {Bytes} signature
     * @throws {Error} when index or signature is invalid
     * @memberof SignableTransaction
     */
    public setSignature(index: number, signature: Bytes): SignableTransaction {
        ow(index, 'index', this.owIndex());
        ow(signature, 'signature', owBytes());

        const pubKey = this.signerAccounts[index].publicKey;
        const signDocHash = this.toSignDocumentHash(index);
        if (!secp256k1.ecdsaVerify(signature.toUint8Array(), signDocHash.toUint8Array(), pubKey.toUint8Array())) {
            throw new Error('Invalid signature');
        }

        this.txRaw.signatures[index] = signature;

        return this;
    }

    private getSignerSignMode(index: number): SIGN_MODE {
        return this.signerAccounts[index].signMode;
    }

    /**
     * Returns true when the signer index is already signed
     * @param {index} index
     * @returns {boolean}
     * @throws {Error} when index is invalid
     * @memberof SignableTransaction
     */
    public isIndexSigned(index: number): boolean {
        ow(index, 'index', this.owIndex());

        return !this.txRaw.signatures[index].isEqual(EMPTY_SIGNATURE);
    }

    private owIndex(): NumberPredicate {
        return ow.number.integer.greaterThanOrEqual(0).validate((val) => ({
            validator: val < this.signerAccounts.length,
            message: (label: string) => `Expected \`${label}\` to be within signer size, got \`${val}\``,
        }));
    }

    /**
     * Returns TxRaw
     * @returns {TxRaw}
     * @memberof SignableTransaction
     */
    public getTxRaw(): Readonly<TxRaw> {
        return this.txRaw;
    }

    /**
     * Return network of the transaction
     * @returns {string}
     * @memberof Transaction
     */
    public getNetwork(): Readonly<Network> {
        return this.network;
    }

    /**
     * Return signed version of the transaction
     * @returns {SignedTransaction}
     * @memberof Transaction
     */
    public toSigned(): SignedTransaction {
        if (!this.isCompletelySigned()) {
            throw new Error('Transaction is not completed signed');
        }
        return new SignedTransaction(this.txRaw);
    }

    /**
     * Returns true when the transaction is completely signed
     * @returns {boolean}
     * @memberof Transaction
     */
    public isCompletelySigned(): boolean {
        return this.txRaw.signatures.every((signature) => !signature.isEqual(EMPTY_SIGNATURE));
    }

    /**
     * Returns the Chain-maind encoded JSON containing SignerInfo
     * @memberof SignableTransaction
     * @returns {unknown} Tx-Encoded JSON
     */
    public toCosmosJSON(): string {
        const txObject = {
            body: Object.create({}),
            authInfo: Object.create({}),
            signatures: Object.create([[]]),
        };

        try {
            // Convert to native types
            const nativeAuthInfo = NativeAuthInfo.decode(this.txRaw.authInfoBytes.toUint8Array());
            const nativeTxBody = NativeTxbody.decode(this.txRaw.bodyBytes.toUint8Array());
            const nativeSignaturesList = this.getTxRaw().signatures.map((byteSig) => byteSig.toUint8Array());

            // Construct JSON bodies individually
            txObject.authInfo = getAuthInfoJson(nativeAuthInfo);
            txObject.body = getTxBodyJson(nativeTxBody);
            txObject.signatures = getSignaturesJson(nativeSignaturesList);

            // CamelCase to snake_case convertor
            const stringifiedTx = JSON.stringify(snakecaseKeys.default(txObject));

            // type_url to @type transformer for matching Cosmos JSON Format
            const cosmosApiFormatTxJson = typeUrlToCosmosTransformer(stringifiedTx);

            return cosmosApiFormatTxJson;
        } catch (error) {
            throw new Error('Error converting SignableTransaction to Cosmos compatible JSON.');
        }
    }
}

export type SignableTransactionParams = {
    rawTxJSON: string;
    signerAccounts?: SignerAccount[];
    network: Network;
};

/**
 * Generate SignDoc binary bytes ready to be signed in direct mode
 */
const makeSignDoc = (txBodyBytes: Bytes, authInfoBytes: Bytes, chainId: string, accountNumber: Big): Bytes => {
    const signDoc = omitDefaults({
        bodyBytes: txBodyBytes.toUint8Array(),
        authInfoBytes: authInfoBytes.toUint8Array(),
        chainId,
    });

    // Omit encoding the Long value when it's either 0, null or undefined to keep it consistent with backend encoding
    // https://github.com/protobufjs/protobuf.js/issues/1138
    if (accountNumber.toNumber()) {
        signDoc.accountNumber = Long.fromNumber(accountNumber.toNumber());
    }
    const signDocProto = cosmos.tx.v1beta1.SignDoc.create(signDoc);
    return Bytes.fromUint8Array(cosmos.tx.v1beta1.SignDoc.encode(signDocProto).finish());
};

const legacyEncodeMsgs = (msgs: CosmosMsg[]): legacyAmino.Msg[] => {
    return msgs.map((msg) => msg.toRawAminoMsg());
};

const legacyEncodeStdFee = (feeAmountList: ICoin[] | undefined, gas: Big | undefined): legacyAmino.StdFee => {
    return {
        amount: feeAmountList ? feeAmountList.map((feeAmount) => feeAmount.toCosmosCoin()) : [],
        gas: gas ? gas.toString() : DEFAULT_GAS_LIMIT.toString(),
    };
};

const legacyEncodeTimeoutHeight = (timeoutHeight: string | undefined): string | undefined => {
    if (typeof timeoutHeight === 'undefined' || timeoutHeight === '0') {
        return undefined;
    }

    return timeoutHeight;
};

const makeLegacyAminoSignDoc = (
    msgs: readonly legacyAmino.Msg[],
    fee: legacyAmino.StdFee,
    chainId: string,
    memo: string,
    accountNumber: number | string,
    sequence: number | string,
    timeoutHeight?: string,
): Bytes => {
    let encodedTimeoutHeight: string | undefined;
    if (typeof timeoutHeight !== 'undefined') {
        encodedTimeoutHeight = legacyAmino.Uint53.fromString(timeoutHeight.toString()).toString();
    }

    const stdSignDocBase: legacyAmino.StdSignDoc = {
        chain_id: chainId,
        account_number: legacyAmino.Uint53.fromString(accountNumber.toString()).toString(),
        sequence: legacyAmino.Uint53.fromString(sequence.toString()).toString(),
        fee,
        msgs,
        memo,
    };
    let stdSignDoc: legacyAmino.StdSignDoc;
    if (typeof timeoutHeight === 'undefined') {
        stdSignDoc = {
            ...stdSignDocBase,
        };
    } else {
        stdSignDoc = {
            ...stdSignDocBase,
            timeout_height: encodedTimeoutHeight,
        };
    }
    return Bytes.fromUint8Array(legacyAmino.toUtf8(legacyAmino.sortedJsonStringify(stdSignDoc)));
};
