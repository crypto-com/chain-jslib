import { Coin } from '../coins';

export interface StdFee {
    readonly amount: readonly Coin[];
    readonly gas: string;
}
