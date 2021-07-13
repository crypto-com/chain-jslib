/* eslint-disable */
// @ts-nocheck
import { expect } from 'chai';
import { fuzzyDescribe } from '../test/mocha-fuzzy/suite';

import { CroNetwork, CroSDK } from '../core/cro';

const cro = CroSDK({ network: CroNetwork.Testnet });

describe('Coin', function () {
    describe('constructor', function () {
        fuzzyDescribe('should throw Error when the provided argument is not (string, Unit)', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.StringArg('1000'), fuzzy.StringArg(cro.Coin.UNIT_BASE));
            testRunner(
                function (args0, args1) {
                    if (!args0.valid) {
                        expect(() => new cro.Coin(args0.value, args1.value)).to.throw(
                            'Expected `amount` to be of type `string`',
                        );
                    } else if (!args1.valid) {
                        expect(() => new cro.Coin(args0.value, args1.value)).to.throw(
                            'Expected `unit` to be of type `string`',
                        );
                    }
                },
                { invalidArgsOnly: true },
            );
        });

        context('When unit is base unit', function () {
            it('should throw Error when the provided string is not a valid number', function () {
                expect(() => new cro.Coin('invalid', cro.Coin.UNIT_BASE)).to.throw(
                    'Expected amount to be a base10 number represented as string',
                );
            });

            it('should throw Error when the provided string is a floating number', function () {
                expect(() => new cro.Coin('1234.5678', cro.Coin.UNIT_BASE)).to.throw(
                    'Expected base amount to be an integer',
                );
            });

            it('should throw Error when the provided string is not a base10 number', function () {
                expect(() => new cro.Coin('0xff', cro.Coin.UNIT_BASE)).to.throw(
                    'Expected amount to be a base10 number represented as string',
                );
            });

            it('should throw Error when the provided string is a negative integer', function () {
                expect(() => new cro.Coin('-1000', cro.Coin.UNIT_BASE)).to.throw('Expected base amount to be positive');
            });

            it('should throw Error if the value exceed total supply', function () {
                expect(() => new cro.Coin('10000000000000000001', cro.Coin.UNIT_BASE)).to.throw(
                    'Expected base amount to be within total supply',
                );
            });

            it('should return a coins object of the provided string', function () {
                const anyBaseValue = '1000';
                const coins = new cro.Coin(anyBaseValue, cro.Coin.UNIT_BASE);

                expect(coins.toString()).to.eq(anyBaseValue);
            });
        });

        context('When unit is CRO', function () {
            it('should throw Error when the provided string is not a valid number', function () {
                expect(() => new cro.Coin('invalid', cro.Coin.UNIT_CRO)).to.throw(
                    'Expected amount to be a base10 number represented as string',
                );
            });

            it('should throw Error when the provided string is not a base10 number', function () {
                expect(() => new cro.Coin('0xff', cro.Coin.UNIT_CRO)).to.throw(
                    'Expected amount to be a base10 number represented as string',
                );
            });

            it('should throw Error when the provided string is a negative integer', function () {
                expect(() => new cro.Coin('-1000', cro.Coin.UNIT_CRO)).to.throw('Expected CRO amount to be positive');
            });

            it('should throw Error when the provided string exceed 8 decimal places', function () {
                expect(() => new cro.Coin('1000.123456789', cro.Coin.UNIT_CRO)).to.throw(
                    'Expected CRO amount to have at most 8 decimal places',
                );
            });

            it('should throw Error if the value exceed total supply', function () {
                expect(() => new cro.Coin('100000000001', cro.Coin.UNIT_CRO)).to.throw(
                    'Expected CRO amount to be within total supply',
                );
            });

            it('should return a coins object of the provided string', function () {
                const anyCROValue = '0.00001';
                const coins = new cro.Coin(anyCROValue, cro.Coin.UNIT_CRO);

                const expectedBaseValue = '1000';
                expect(coins.toString()).to.eq(expectedBaseValue);
            });
        });

        context('When `denom` is passed along other params', function () {
            it('should throw Error when the provided `units` and `denom` do not belong to same network', function () {
                expect(() => new cro.Coin('1000000', cro.Coin.UNIT_CRO, 'cosmos')).to.throw(
                    'Provided Units and Denom do not belong to the same network.',
                );
            });
            // it('should throw Error on empty `denom`', function () {
            //     expect(() => new cro.Coin('1000000', cro.Coin.UNIT_CRO, '')).to.throw(
            //         'Expected string `denom` to have a minimum length of `1`, got ``',
            //     );
            // });
            it('should set the `denom` correctly', function () {
                expect(() => new cro.Coin('1000000', cro.Coin.UNIT_BASE, 'cosmos')).to.not.throw();

                const coin = new cro.Coin('1000000', cro.Coin.UNIT_BASE, 'cosmos');
                expect(coin.denom).to.equal('cosmos');
                expect(coin.baseAmount.toString()).to.equal('1000000');
            });
            it('should return `baseAmount` correctly on same network `unit` & `denom`', function () {
                expect(() => new cro.Coin('1000000', cro.Coin.UNIT_CRO, 'cro')).to.not.throw();
                expect(() => new cro.Coin('1000000', cro.Coin.UNIT_CRO, 'tcro')).to.not.throw();

                const CROcoin = new cro.Coin('11111111', cro.Coin.UNIT_CRO, 'cro');
                const TCROcoin = new cro.Coin('22222222', cro.Coin.UNIT_CRO, 'tcro');

                expect(CROcoin.denom).to.equal('cro');
                expect(TCROcoin.denom).to.equal('tcro');

                expect(TCROcoin.baseAmount.toString()).to.equal('2222222200000000');
                expect(TCROcoin.toString()).to.equal('2222222200000000');
                expect(TCROcoin.toString(cro.Coin.UNIT_CRO)).to.equal('22222222');

                expect(CROcoin.baseAmount.toString()).to.equal('1111111100000000');
                expect(CROcoin.toString()).to.equal('1111111100000000');
                expect(CROcoin.toString(cro.Coin.UNIT_CRO)).to.equal('11111111');
            });
        });
    });

    describe('fromCustomAmountDenom', function () {
        fuzzyDescribe('should throw Error when the provided value is not a string', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.StringArg('1000'));
            testRunner(
                function (arg) {
                    expect(() => cro.Coin.fromCustomAmountDenom(arg.value, arg.value)).to.throw(
                        'Expected `amount` to be of type `string`',
                    );
                },
                { invalidArgsOnly: true },
            );
        });

        it('should throw Error when the provided string is not a valid number', function () {
            expect(() => cro.Coin.fromCustomAmountDenom('invalid', 'invalid')).to.throw(
                'Expected amount to be a base10 number represented as string,',
            );
        });

        it('should return `coin` instance on correct params', function () {
            const coin = cro.Coin.fromCustomAmountDenom('1000', 'uatom');
            expect(coin.denom).to.equal('uatom');
            expect(coin.baseAmount.toString()).to.equal('1000');
            expect(coin.toCosmosCoin().amount).to.equal('1000');
            expect(coin.toCosmosCoin().denom).to.equal('uatom');
        });
    });

    describe('fromBaseUnit', function () {
        fuzzyDescribe('should throw Error when the provided value is not a string', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.StringArg('1000'));
            testRunner(
                function (arg) {
                    expect(() => cro.Coin.fromBaseUnit(arg.value)).to.throw('Expected `amount` to be of type `string`');
                },
                { invalidArgsOnly: true },
            );
        });

        it('should throw Error when the provided string is not a valid number', function () {
            expect(() => cro.Coin.fromBaseUnit('invalid')).to.throw(
                'Expected amount to be a base10 number represented as string,',
            );
        });

        it('should throw Error when the provided string is a floating number', function () {
            expect(() => cro.Coin.fromBaseUnit('1234.5678')).to.throw('Expected base amount to be an integer');
            expect(() => cro.Coin.fromBaseUnit('-1234.5678')).to.throw('Expected base amount to be an integer');
        });

        it('should throw Error when the provided string is not a base10 number', function () {
            expect(() => cro.Coin.fromBaseUnit('0xff')).to.throw(
                'Expected amount to be a base10 number represented as string',
            );
        });

        it('should throw Error when the provided string is a negative integer', function () {
            expect(() => cro.Coin.fromBaseUnit('-1000')).to.throw('Expected base amount to be positive');
        });

        it('should throw Error if the value exceed total supply', function () {
            expect(() => cro.Coin.fromBaseUnit('10000000000000000001')).to.throw(
                'Expected base amount to be within total supply',
            );
        });

        it('should return a coins object of the provided base unit string', function () {
            const anyBaseValue = '1000';
            const coins = cro.Coin.fromBaseUnit(anyBaseValue);
            expect(coins.toString()).to.eq(anyBaseValue);
        });
    });

    describe('fromCRO', function () {
        fuzzyDescribe('should throw Error when the provided value is not a string', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.StringArg('0.1'));
            testRunner(
                function (arg) {
                    expect(() => cro.Coin.fromCRO(arg.value)).to.throw('Expected `amount` to be of type `string`');
                },
                { invalidArgsOnly: true },
            );
        });

        it('should throw Error when the provided string is not a valid number', function () {
            expect(() => cro.Coin.fromCRO('invalid')).to.throw(
                'Expected amount to be a base10 number represented as string',
            );
        });

        it('should throw Error when the provided string exceeds 8 decimal places', function () {
            expect(() => cro.Coin.fromCRO('1000.123456789')).to.throw(
                'Expected CRO amount to have at most 8 decimal places',
            );
            expect(() => cro.Coin.fromCRO('-1000.123456789')).to.throw(
                'Expected CRO amount to have at most 8 decimal places',
            );
        });

        it('should throw Error when the provided string is not a base10 number', function () {
            expect(() => cro.Coin.fromCRO('0xff')).to.throw(
                'Expected amount to be a base10 number represented as string',
            );
        });

        it('should throw Error when the provided string is a negative integer', function () {
            expect(() => cro.Coin.fromCRO('-1000')).to.throw('Expected CRO amount to be positive');
        });

        it('should throw Error if the value exceed total supply', function () {
            expect(() => cro.Coin.fromCRO('10000000000000000001')).to.throw(
                'Expected CRO amount to be within total supply',
            );
        });

        it('should return a coins object of the provided CRO unit string', function () {
            const anyCROValue = '0.00001';
            const coins = cro.Coin.fromCRO(anyCROValue);

            const expectedBaseValue = '1000';
            expect(coins.toString()).to.eq(expectedBaseValue);
        });
    });

    xdescribe('add', function () {
        fuzzyDescribe('should throw Error when the provided coins is not an instance of Coin', function (fuzzy) {
            const anyValidCoin = cro.Coin.fromBaseUnit('1000');
            const testRunner = fuzzy(fuzzy.ObjArg(anyValidCoin));
            testRunner(
                function (arg) {
                    const anyCoin = cro.Coin.fromBaseUnit('1000');

                    let expectedErrMsg: string;
                    if (arg.type === fuzzy.Object) {
                        expectedErrMsg = 'Expected argument to be an instance of `Coin`';
                    } else {
                        expectedErrMsg = 'Expected argument to be of type `object`';
                    }
                    expect(() => anyCoin.add(arg.value)).to.throw(expectedErrMsg);
                },
                { invalidArgsOnly: true },
            );
        });

        it('should throw Error when the result exceeds total supply', function () {
            const totalSupply = cro.Coin.TOTAL_SUPPLY;
            const oneBaseUnit = cro.Coin.fromBaseUnit('1');

            expect(() => totalSupply.add(oneBaseUnit)).to.throw('Adding two Coin together exceed total supply');
        });

        it('should return the sum of the two coins', function () {
            const anyCoin = cro.Coin.fromBaseUnit('1000');
            const anyAnotherCoin = cro.Coin.fromBaseUnit('10000000');

            expect(anyCoin.add(anyAnotherCoin).toString()).to.eq('10001000');
        });

        it('should return a cro.coins without modifying the original coins', function () {
            const anyCoinValue = '1000';
            const anyCoin = cro.Coin.fromBaseUnit(anyCoinValue);
            const anyAnotherCoin = cro.Coin.fromBaseUnit('10000000');

            anyCoin.add(anyAnotherCoin);
            expect(anyCoin.toString()).to.eq(anyCoinValue);
        });
    });

    describe('sub', function () {
        fuzzyDescribe('should throw Error when the provided coins is not an instance of Coin', function (fuzzy) {
            const anyValidCoin = cro.Coin.fromBaseUnit('1000');
            const testRunner = fuzzy(fuzzy.ObjArg(anyValidCoin));
            testRunner(
                function (arg) {
                    const anyCoin = cro.Coin.fromBaseUnit('1000');

                    let expectedErrMsg: string;
                    if (arg.type === fuzzy.Object) {
                        expectedErrMsg = 'Expected argument to be an instance of `Coin`';
                    } else {
                        expectedErrMsg = 'Expected argument to be of type `object`';
                    }
                    expect(() => anyCoin.sub(arg.value)).to.throw(expectedErrMsg);
                },
                { invalidArgsOnly: true },
            );
        });

        it('should throw Error when the result is negative', function () {
            const oneBaseUnit = cro.Coin.fromBaseUnit('1');
            const twoBaseUnit = cro.Coin.fromBaseUnit('2');

            expect(() => oneBaseUnit.sub(twoBaseUnit)).to.throw('Subtracting the Coin results in negation Coin');
        });

        it('should return the result of subtracting Coin with the provided Coin', function () {
            const anyCoin = cro.Coin.fromBaseUnit('10006000');
            const anyAnotherCoin = cro.Coin.fromBaseUnit('1000');

            expect(anyCoin.sub(anyAnotherCoin).toString()).to.eq('10005000');
        });

        it('should return a cro.coins without modifying the original coins', function () {
            const anyCoinValue = '10006000';
            const anyCoin = cro.Coin.fromBaseUnit(anyCoinValue);
            const anyAnotherCoin = cro.Coin.fromBaseUnit('1000');

            anyCoin.sub(anyAnotherCoin);
            expect(anyCoin.toString()).to.eq(anyCoinValue);
        });
    });

    describe('toCosmosCoin', function () {
        it('should return the Cosmos Coin object', function () {
            const anyCoin = cro.Coin.fromBaseUnit('1000');
            expect(anyCoin.toCosmosCoin()).to.deep.eq({
                amount: '1000',
                denom: CroNetwork.Testnet.coin.baseDenom,
            });
        });
    });

    describe('toString', function () {
        fuzzyDescribe('should throw Error when the provided unit is not a string', function (fuzzy) {
            const testRunner = fuzzy(fuzzy.optional(fuzzy.String)(cro.Coin.UNIT_BASE));
            testRunner(
                function (arg) {
                    const anyCoin = cro.Coin.fromBaseUnit('1000');
                    expect(() => anyCoin.toString(arg.value)).to.throw('Expected argument to be of type `string`');
                },
                { invalidArgsOnly: true },
            );
        });

        it('should throw Error when the provided unit is invalid', function () {
            const anyCoin = cro.Coin.fromBaseUnit('1000');

            expect(() => anyCoin.toString('invalid' as any)).to.throw('Expected string to be one of the Coin units');
        });

        it('should return the base unit when no unit is provided', function () {
            const anyBaseValue = '1000';
            const coins = cro.Coin.fromBaseUnit(anyBaseValue);

            expect(coins.toString()).to.eq(anyBaseValue);
        });

        it('should return the base unit when unit is base', function () {
            const anyBaseValue = '1000';
            const coins = cro.Coin.fromBaseUnit(anyBaseValue);

            expect(coins.toString(cro.Coin.UNIT_BASE)).to.eq(anyBaseValue);
        });

        it('should return the CRO value when unit is CRO', function () {
            const anyBaseValue = '1000';
            const coins = cro.Coin.fromBaseUnit(anyBaseValue);

            const expectedCROValue = '0.00001';
            expect(coins.toString(cro.Coin.UNIT_CRO)).to.eq(expectedCROValue);
        });

        it('should return the CRO value when unit is CRO and has 8 decimal places', function () {
            const anyBaseValue = '12345678';
            const coins = cro.Coin.fromBaseUnit(anyBaseValue);

            const expectedCROValue = '0.12345678';
            expect(coins.toString(cro.Coin.UNIT_CRO)).to.eq(expectedCROValue);
        });
    });
});
