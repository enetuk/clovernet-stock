import {Connection, Repository} from "typeorm";
import {DealPriceEntity, TokenPairEntity} from "../entities";
import {DateTime} from "luxon";
import {getRandomNumber} from "../utils/price_utils";

export enum PriceAggregationPeriod {
  HOUR = "hour",
  DAY = "day"
}

export interface PriceAggregationItem {
  time: string;
  value: number;
}

export class DealPriceService {
  private readonly _connection: Connection;
  private readonly _dealPriceRepository: Repository<DealPriceEntity>;
  private readonly _tokenPairsRepository: Repository<TokenPairEntity>;

  constructor(connection: Connection) {
    this._connection = connection;
    this._dealPriceRepository = this._connection.manager.getRepository<DealPriceEntity>(DealPriceEntity);
    this._tokenPairsRepository = this._connection.manager.getRepository<TokenPairEntity>(TokenPairEntity);
  }

  public async getAggregatedPriceByPeriod(priceAggregationPeriod: PriceAggregationPeriod, tokenPair?: string): Promise<PriceAggregationItem[]> {
    let query = this._connection.manager.getRepository<DealPriceEntity>(DealPriceEntity)
      .createQueryBuilder('prices')
      .select("sum(prices.price * prices.tradeSize) / sum(prices.tradeSize)", "value")
      .addSelect(`date_trunc('${priceAggregationPeriod}', prices.time)`, "date");

    if (tokenPair) {
      query = query.where("prices.tokenPair = :tokenPair", {tokenPair})
    }

    const res = (await query.groupBy("date")
      .orderBy("date")
      .getRawMany())
      .map(i => ({
        time: i.date,
        value: Number(Number(i.value).toFixed(2))
      }));

    return this.aggregateValues(res, priceAggregationPeriod);
  }

  private aggregateValues(values: PriceAggregationItem[], priceAggregationPeriod: PriceAggregationPeriod): PriceAggregationItem[] {
    if (!values || !values.length) return [];

    const unit = priceAggregationPeriod === PriceAggregationPeriod.DAY ? "day" : "hour";
    const startDate = DateTime.fromJSDate(new Date(values[0].time));
    const endDate = DateTime.local().startOf(unit);
    let currentDate = startDate;

    const elementsCount = values.length;
    let currentIndex = 0;

    const result: PriceAggregationItem[] = [];

    while (currentDate.toJSDate().getTime() <= endDate.toJSDate().getTime()) {
      if (currentIndex < elementsCount && new Date(currentDate.toISO()).getTime() === new Date(values[currentIndex].time).getTime()) {
        result.push(values[currentIndex]);
        currentIndex++;
      } else {
        const prev = result[result.length - 1];
        result.push({
          time: currentDate.toISO(),
          value: prev.value
        });
      }
      currentDate = currentDate.plus( unit === "day" ? {days: 1} : {hours: 1});
    }

    return result;
  }

  public async seedDealPriceEntities(): Promise<void> {
    let currentDate = new Date();
    const seedData: DealPriceEntity[] = [];
    const endDate: Date = DateTime.fromJSDate(currentDate).minus({months: 1}).toJSDate();

    const f = (x: number) => (-0.17 * x + 10);
    const tokenPairs: TokenPairEntity[] = await this._tokenPairsRepository.find();

    tokenPairs.forEach(pair => {
      while (currentDate.getTime() > endDate.getTime()) {
        const diffTime = currentDate.getTime() - endDate.getTime();
        const deltaDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const price = f(deltaDays);
        seedData.push(new DealPriceEntity({
          tokenPair: pair.id,
          price: getRandomNumber(price - 1, price + 1),
          tradeSize: getRandomNumber(10, 50),
          time: currentDate
        }));
        currentDate = DateTime.fromJSDate(currentDate).minus({minutes: 5}).toJSDate();
      }
    });

    await this._connection.manager.save(DealPriceEntity, seedData);
  }
}
