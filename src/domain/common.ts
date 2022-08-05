import axios from 'axios';
import { logger } from '@config/logger';
import { TRADER_EVENTS, EventType } from '@server/events.types';

// Third Part Stock Market API Calls

const stockMarketAxios = axios.create({
    baseURL: 'https://stock-market-data.p.rapidapi.com',
    headers: {
        'X-RapidAPI-Key': 'fa408dbb9emsh6572bcb220f8f6dp14efa2jsncbd6f328dbe6',
        'X-RapidAPI-Host': 'stock-market-data.p.rapidapi.com'
    }
});

const stockMarketParams = (symbol: string) => ({ ticker_symbol: symbol, years: '1', format: 'json' });

export async function fetchStockPriceAt(symbol: string, date: Date) {
    logger.info('Fetching historical data');

    const res = await stockMarketAxios.get('/stock/historical-prices', {
        params: stockMarketParams(symbol)
    })

    const { data: { "historical prices": historicalPrices } } = res;

    for (const price of historicalPrices) {
        if (new Date(price.Date).toDateString() === date.toDateString()) {
            return price;
        }
    }

    throw new Error(`Unable to find historical price for ${symbol} on ${date}`)
}

// Common Functions

export function isTickerSymbolValid(symbol: string) {
    return symbol.length > 0 && symbol.length < 5;
}

export function isTradeDateValid(trader_id: string, date: Date) {
    const traderEvents = TRADER_EVENTS[trader_id];
    const lastTraderEvent = traderEvents[traderEvents.length - 1];

    if ([EventType.BUY, EventType.SELL].includes(lastTraderEvent.type)) {
        return lastTraderEvent.date <= date;
    }
    return true;
}
