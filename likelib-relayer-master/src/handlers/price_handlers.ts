import {DealPriceService, PriceAggregationPeriod} from "../services/deal_price_service";
import * as express from "express";
import * as HttpStatus from "http-status-codes";
import {StatusCodes} from "http-status-codes";

export class PriceHandlers {
  private readonly _dealPriceService;

  constructor(dealPriceService: DealPriceService) {
    this._dealPriceService = dealPriceService;
  }

  public static rootAsync(_req: express.Request, res: express.Response): void {
    const message = `Deal price service root.`;
    res.status(HttpStatus.OK).send({ message });
  }

  public async getAggregatedPriceByPeriod(req: express.Request, res: express.Response): Promise<void> {
    const period = req.query.period as PriceAggregationPeriod || PriceAggregationPeriod.DAY;
    const tokenPair = (req.query.tokenPair as string);
    try {
      const aggregatedData = await this._dealPriceService.getAggregatedPriceByPeriod(period, tokenPair);
      res.status(StatusCodes.OK).send(aggregatedData);
    } catch (e) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({error: e});
    }
  }

  public async seedPriceTable(req: express.Request, res: express.Response): Promise<void> {
    await this._dealPriceService.seedDealPriceEntities();
    res.status(StatusCodes.OK).send({});
  }
}
