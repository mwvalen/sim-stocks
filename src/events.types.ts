export enum EventType {
    CREATE,
    BUY,
    SELL
}

export interface CreateEvent {
    type: EventType.CREATE,
    name: string,
    id: string,
}

export interface BuyEvent {
    type: EventType.BUY,
    id: string,
    symbol: string,
    quantity: number,
    date: Date,
    price: number,
}

export interface SellEvent {
    type: EventType.SELL,
    id: string,
    symbol: string,
    quantity: number,
    date: Date,
    price: number,
}

export const TRADER_EVENTS: Map<[trader_id: string], Event[]> = new Map()

export interface Response {
    status: 'success' | 'fail';
    error?: string;
}

export interface Position {
    symbol: string,
    quantity: number,
    total_pl: number,
}
