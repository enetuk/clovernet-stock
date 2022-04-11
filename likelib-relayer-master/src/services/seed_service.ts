import {UsersService} from "./users_service";
import {TokenService} from "./token_service";
import {DealPriceService} from "./deal_price_service";
import {randomAddress} from "@0x/contracts-test-utils";
import {OrderBookService} from "./orderbook_service";
import {BinanceService} from "./binance_service";

const Ripemd160 = require("ripemd160");
const Base58 = require('base-58');

const useBinance = true;

function randomAddressBase58() {
  const addr = randomAddress();
  const ripemd = new Ripemd160().update(addr).digest();
  return Base58.encode(ripemd);
}

export class SeedService {
  private readonly _usersService: UsersService;
  private readonly _tokensService: TokenService;
  private readonly _dealPriceService: DealPriceService;
  private readonly _orderbookService: OrderBookService;
  private readonly _binanceService: BinanceService;

  constructor(usersService: UsersService,
              tokensService: TokenService,
              dealPriceService: DealPriceService,
              orderbookService: OrderBookService,
              binanceService: BinanceService) {
        this._usersService = usersService;
        this._tokensService = tokensService;
        this._dealPriceService = dealPriceService;
        this._orderbookService = orderbookService;
        this._binanceService = binanceService;
  }

  public async seedData(): Promise<void> {
    const userAddress1 = randomAddressBase58();
    const userAddress2 = randomAddressBase58();

    await this._tokensService.seedTokenPairs();

    await this._usersService.findOrCreateUserByAddress(userAddress1);
    await this._usersService.findOrCreateUserByAddress(userAddress2);

    if (useBinance) {
      await this._binanceService.generate();
    } else {
      await this._dealPriceService.seedDealPriceEntities();
    }

    await this._orderbookService.seedDatabase(userAddress1, userAddress2);
  }
}
