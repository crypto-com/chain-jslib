export type Network = {
    defaultNodeUrl: string;
    chainId: string;
    addressPrefix: string;
    validatorAddressPrefix: string;
    validatorPubKeyPrefix: string;
    defaultNodeUrl: string,
    coin: {
        baseDenom: string;
        croDenom: string;
    };
    bip44Path: {
        coinType: number;
        account: number;
    };
};
