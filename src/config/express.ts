import express from 'express';
import { stockMarket } from '@server/domain/stock-market'; // not sure if this is intended
import { logger } from '@config/logger';

const createServer = (): express.Application => {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.disable('x-powered-by');

  app.get('/health', (_req, res) => {
    res.send('UP');
  });

  app.post('/traders', (_req: any, res) => {
    const { name } = _req.body;

    try {
      const response = stockMarket.createTrader(name);

      res.send(response);
    } catch (err: any) {
      logger.error(err);
      res.send(err.message);
    }
  });

  app.patch('/traders/:trader_id/trades/buy', async (_req: any, res) => {
    const { params: { trader_id }, body: { symbol, date, quantity } } = _req;

    try {
      await stockMarket.buy(trader_id, symbol, new Date(date), quantity);

      res.send({
        status: 'success'
      });
    } catch (err: any) {
      logger.error(err);
      res.send({
        status: 'fail',
        error: err.message
      });
    }
  });

  app.patch('/traders/:trader_id/trades/sell', async (_req, res) => {
    const { params: { trader_id }, body: { symbol, date, quantity } } = _req;

    try {
      await stockMarket.sell(trader_id, symbol, new Date(date), quantity);

      res.send({
        status: 'success'
      });
    } catch (err: any) {
      logger.error(err);
      res.send({
        status: 'fail',
        error: err.message
      });
    }
  });

  app.get('/traders/:trader_id/positions', (_req, res) => {
    try {
      const { trader_id } = _req.params;
      const response = stockMarket.positions(trader_id);

      res.send(response);
    } catch (err: any) {
      logger.error(err);
      res.send({
        status: 'fail',
        error: err.message
      });
    }
  });

  return app;
};

export { createServer };
