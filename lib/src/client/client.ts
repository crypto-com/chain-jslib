import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import {
    StargateClient,
    QueryClient,
    AuthExtension,
    BankExtension,
    DistributionExtension,
    StakingExtension,
    setupAuthExtension,
    setupBankExtension,
    setupDistributionExtension,
    setupStakingExtension,
    IbcExtension,
    setupIbcExtension,
} from '@cosmjs/stargate';
import { Account } from '@cosmjs/stargate/build/accounts';
import { Coin } from '@cosmjs/stargate/build/codec/cosmos/base/v1beta1/coin';
import { SearchTxFilter, SearchTxQuery } from '@cosmjs/stargate/build/search';
import { Block, BroadcastTxResponse, IndexedTx, SequenceResponse } from '@cosmjs/stargate/build/stargateclient';
import ow from 'ow';
import { InitConfigurations } from '../core/cro';
import { owUrl } from './ow.types';

export interface ICroClient {
    query():
        | (QueryClient & AuthExtension & BankExtension & DistributionExtension & StakingExtension & IbcExtension)
        | undefined;
    getChainId(): Promise<string>;
    getHeight(): Promise<number>;
    getAccount(searchAddress: string): Promise<Account | null>;
    getAccountVerified(searchAddress: string): Promise<Account | null>;
    getSequence(address: string): Promise<SequenceResponse>;
    getBlock(height?: number): Promise<Block>;
    getCroBalance(address: string): Promise<Coin>;
    getTx(id: string): Promise<IndexedTx | null>;
    searchTx(query: SearchTxQuery, filter?: SearchTxFilter): Promise<readonly IndexedTx[]>;
    disconnect(): void;
    broadcastTx(tx: Uint8Array): Promise<BroadcastTxResponse>;
}

export const croClient = function (config: InitConfigurations) {
    return class CroClient implements ICroClient {
        tmClient: Tendermint34Client;

        baseDenom: string;

        readonly txClient: StargateClient;

        readonly queryClient:
            | (QueryClient & AuthExtension & BankExtension & DistributionExtension & StakingExtension & IbcExtension)
            | undefined;

        private constructor(tmClient: Tendermint34Client, txClient: StargateClient) {
            this.txClient = txClient;
            this.tmClient = tmClient;
            this.queryClient = QueryClient.withExtensions(
                tmClient,
                setupAuthExtension,
                setupBankExtension,
                setupStakingExtension,
                setupDistributionExtension,
                setupIbcExtension,
            );

            this.baseDenom = config.network.coin.baseDenom;
        }

        public static async connect(endpoint: string = config.network.rpcUrl ?? ''): Promise<CroClient> {
            ow(endpoint, 'endpoint', owUrl);
            const tmClient = await Tendermint34Client.connect(endpoint);
            const txClient = await StargateClient.connect(endpoint);
            return new CroClient(tmClient, txClient);
        }

        public disconnect(): void {
            if (this.tmClient) this.tmClient.disconnect();
            if (this.txClient) this.txClient.disconnect();
        }

        public query():
            | (QueryClient & AuthExtension & BankExtension & DistributionExtension & StakingExtension & IbcExtension)
            | undefined {
            return this.queryClient;
        }

        public async getChainId(): Promise<string> {
            return this.txClient.getChainId();
        }

        public async getHeight(): Promise<number> {
            return this.txClient.getHeight();
        }

        public async getAccount(searchAddress: string): Promise<Account | null> {
            return this.txClient.getAccount(searchAddress);
        }

        public async getAccountVerified(searchAddress: string): Promise<Account | null> {
            return this.txClient.getAccountVerified(searchAddress);
        }

        public async getSequence(address: string): Promise<SequenceResponse> {
            return this.txClient.getSequence(address);
        }

        public async getBlock(height?: number): Promise<Block> {
            return this.txClient.getBlock(height);
        }

        public async getCroBalance(address: string): Promise<Coin> {
            return this.txClient.getBalance(address, this.baseDenom);
        }

        public async getTx(id: string): Promise<IndexedTx | null> {
            return this.txClient.getTx(id);
        }

        public async searchTx(query: SearchTxQuery, filter?: SearchTxFilter): Promise<readonly IndexedTx[]> {
            return this.txClient.searchTx(query, filter);
        }

        public async broadcastTx(tx: Uint8Array): Promise<BroadcastTxResponse> {
            return this.txClient.broadcastTx(tx);
        }
    };
};
