/* eslint-disable camelcase */
export interface CosmosTx {
    body: Body;
    auth_info: AuthInfo;
    signatures: string[];
}

interface AuthInfo {
    signer_infos: SignerInfo[];
    fee: Fee;
}

interface Fee {
    amount: Amount[];
    gas_limit: string;
    payer: string;
    granter: string;
}

interface Amount {
    denom: string;
    amount: string;
}

interface SignerInfo {
    public_key: SingleSignerInfoPublicKey | MultiSignerInfoPublicKey;
    mode_info: SignerInfoModeInfo;
    sequence: string;
}

interface SignerInfoModeInfo {
    single?: Single;
    multi?: Multi;
}

interface Multi {
    bitarray: Bitarray;
    mode_infos: ModeInfoElement[];
}

interface Bitarray {
    extra_bits_stored: number;
    elems: string;
}

interface ModeInfoElement {
    single: Single;
}

interface Single {
    mode: string;
}

interface SingleSignerInfoPublicKey {
    '@type': string;
    key: string;
}

interface MultiSignerInfoPublicKey {
    '@type': string;
    threshold?: number;
    public_keys: PublicKeyElement[];
}

interface PublicKeyElement {
    '@type': string;
    key: string;
}

interface Body {
    messages: Message[];
    memo: string;
    timeout_height: string;
    extension_options: any[];
    non_critical_extension_options: any[];
}

interface Message {
    '@type': string;
    [key: string]: any;
}

interface Amount {
    denom: string;
    amount: string;
}
