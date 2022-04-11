import {DealPriceService} from "../services/deal_price_service";
import * as express from 'express';
import {PriceHandlers} from "../handlers/price_handlers";
import * as asyncHandler from "express-async-handler";

export function createPriceRouter(dealPriceService: DealPriceService): express.Router {
  const router = express.Router();
  const handlers = new PriceHandlers(dealPriceService);

  router.get('/', asyncHandler(PriceHandlers.rootAsync.bind(PriceHandlers)));
  router.get('/aggregation', asyncHandler(handlers.getAggregatedPriceByPeriod.bind(handlers)));
  router.get('/seed', asyncHandler(handlers.seedPriceTable.bind(handlers)));

  return router;
}
