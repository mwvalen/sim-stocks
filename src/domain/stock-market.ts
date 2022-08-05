import { logger } from '../config/logger';
import { Trader } from './trader';
import { isTickerSymbolValid, fetchStockPriceAt, isTradeDateValid } from '@server/domain/common';

// Stock Market Class handling all event sourcing

class StockMarket {
    traderMap: Map<[trader_id: string], Trader> = new Map()

    createTrader(name: string) {
        if (name.length > 10) {
            throw new Error("Trader name cannot be longer than 100 characters");
        }

        const trader = new Trader(name);
        this.traderMap[trader.id] = trader;

        logger.info(`Successfully created new trader ${name}`)

        return { trader_id: trader.id };
    }

    async buy(trader_id: string, symbol: string, date: Date, quantity: number) {
        if (!isTickerSymbolValid(symbol)) {
            throw new Error(`Invalid ticker symbol ${symbol}`);
        }

        if (!isTradeDateValid(trader_id, date)) {
            throw new Error('Date needs to be on or after the previous buy/sell date');
        }

        const price: any = await fetchStockPriceAt(symbol, date);
        const trader = this.traderMap[trader_id];

        trader.buy(symbol, date, quantity, price.Open);
    }

    async sell(trader_id: string, symbol: string, date: Date, quantity) {
        if (!isTickerSymbolValid(symbol)) {
            throw new Error(`Invalid ticker symbol ${symbol}`);
        }

        if (!isTradeDateValid(trader_id, date)) {
            throw new Error('Date needs to be on or after the previous buy/sell date');
        }

        const price: any = await fetchStockPriceAt(symbol, date);
        const trader = this.traderMap[trader_id];

        trader.sell(symbol, date, quantity, price.Close);
    }

    positions(trader_id: string) {
        const trader = this.traderMap[trader_id];
        return trader.positions();
    }
}

export const stockMarket = new StockMarket();
