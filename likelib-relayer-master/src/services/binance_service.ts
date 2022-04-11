import {DealPriceEntity, TokenPairEntity} from "../entities";
import {DateTime} from "luxon";
import {logger} from "../logger";
// @ts-ignore
import {Spot} from '@binance/connector';
import {getRandomNumber} from "../utils/price_utils";
import {Connection, Repository} from "typeorm";

export class BinanceService {
    private readonly _connection: Connection;
    private readonly _apiKey = process.env.BINANCE_API_KEY;
    private readonly _secretKey = process.env.BINANCE_SECRET_KEY;

    private readonly _tokenPairRepository: Repository<TokenPairEntity>;

    constructor(connection: Connection) {
        this._connection = connection;
        this._tokenPairRepository = this._connection.manager.getRepository<TokenPairEntity>(TokenPairEntity);
    }

    public async generateByPair(pair: TokenPairEntity) {
        let currentDate = new Date();
        const seedData: DealPriceEntity[] = [];
        const endDate: Date = DateTime.fromJSDate(currentDate).minus({months: 1}).toJSDate();

        let baseTokenSymbol = pair.baseToken?.symbol;
        let quoteTokenSymbol = pair.quoteToken?.symbol;

        if (!baseTokenSymbol || !quoteTokenSymbol) {
            logger.error(`base token or quote token has no baseToken names: baseTokenSymbol: ${baseTokenSymbol}, quoteTokenSymbol: quoteTokenSymbol`);
            return;
        }

        baseTokenSymbol = baseTokenSymbol.toUpperCase();
        quoteTokenSymbol = quoteTokenSymbol.toUpperCase();
        const symbol = baseTokenSymbol + quoteTokenSymbol;

        const client = new Spot(this._apiKey, this._secretKey);
        const {data} = await client.klines(symbol, '1h');
        /*
            [
              [
                1499040000000,      // Open time
                "0.01634790",       // Open
                "0.80000000",       // High
                "0.01575800",       // Low
                "0.01577100",       // Close
                "148976.11427815",  // Volume
                1499644799999,      // Close time
                "2434.19055334",    // Quote asset volume
                308,                // Number of trades
                "1756.87402397",    // Taker buy base asset volume
                "28.46694368",      // Taker buy quote asset volume
                "17928899.62484339" // Ignore.
              ]
            ]
         */

        for (const candle of data) {
            seedData.push(new DealPriceEntity({
                price: Number(candle[4]),
                time: new Date(Number(candle[0])),
                tokenPair: pair.id,
                tradeSize: getRandomNumber(10, 50),
            }))
        }

        await this._connection.manager.save(DealPriceEntity, seedData);
    }

    async getTokenPairs(): Promise<TokenPairEntity[]> {
        return this._tokenPairRepository.find();
    }

    public async generate(): Promise<void> {
        for (const pair of await this.getTokenPairs()) {
            await this.generateByPair(pair);
        }
    }
}