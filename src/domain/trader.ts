import { BuyEvent, CreateEvent, EventType, Position, SellEvent, TRADER_EVENTS } from '@server/events.types';
import { v4 as uuidv4 } from 'uuid';

export class Trader {
    public id: string;
    name: string;
    positionMap: Map<string, Object>;

    constructor(name: string) {
        this.name = name;
        this.id = uuidv4();

        const event: CreateEvent = {
            type: EventType.CREATE,
            name,
            id: this.id
        }
        TRADER_EVENTS[this.id] = [event];
    }

    buy(symbol: string, date: Date, quantity: number, price: number) {
        const event: BuyEvent = {
            type: EventType.BUY,
            id: this.id,
            symbol,
            quantity,
            date,
            price,
        }
        TRADER_EVENTS[this.id].push(event);
    }

    sell(symbol: string, date: Date, quantity: number, price: number) {
        const event: SellEvent = {
            type: EventType.SELL,
            id: this.id,
            symbol,
            quantity,
            date,
            price,
        }
        TRADER_EVENTS[this.id].push(event);

        const { positions } = this.positions();
        const lastTotalPL = positions[positions.length - 1].total_pl;

        if (lastTotalPL - (quantity * price) < 0) {
            throw new Error('Selling will make position go into the negative');
        }
    }

    positions() {
        const traderEvents = TRADER_EVENTS[this.id];
        const positions: Position[] = [];
        let totalPL = 0;

        for (const event of traderEvents) {
            if ([EventType.BUY, EventType.SELL].includes(event.type)) {
                const profitOrLoss = event.price * event.quantity;
                totalPL += event.type === EventType.BUY ? profitOrLoss : -profitOrLoss;

                positions.push({
                    symbol: event.symbol,
                    quantity: event.quantity,
                    total_pl: totalPL,
                })
            }
        }

        return {
            trader_name: this.name,
            trader_id: this.id,
            positions,
        }
    }
}
