// import {
//     artifacts,
//     AssetSwapperContractAddresses,
//     ContractAddresses,
//     ERC20BridgeSamplerContract,
//     SupportedProvider,
// } from '@0x/asset-swapper';
// import { getContractAddressesForChainOrThrow } from '@0x/contract-addresses';
// import { Web3Wrapper } from '@0x/dev-utils';
import { Connection } from 'typeorm';

import { SRA_PATH } from './constants';
import { getDBConnectionAsync } from './db_connection';
import { OrderBookService } from './services/orderbook_service';
import {
    HttpServiceConfig,
    WebsocketSRAOpts,
} from './types';
import {UsersService} from "./services/users_service";
import {DealPriceService} from "./services/deal_price_service";
import {TokenService} from "./services/token_service";
import {SeedService} from "./services/seed_service";
import {OperationService} from "./services/operation_service";
import {BinanceService} from "./services/binance_service";

export interface AppDependencies {
    connection: Connection;
    orderBookService: OrderBookService;
    userService: UsersService;
    dealPriceService: DealPriceService;
    tokenService: TokenService;
    seedService: SeedService;
    operationService: OperationService;
    websocketOpts: Partial<WebsocketSRAOpts>;
}

/**
 * Instantiates dependencies required to run the app. Uses default settings based on config
 * @param config should contain a URI for mesh to listen to, and the ethereum RPC URL
 */
export async function getDefaultAppDependenciesAsync(
    config: HttpServiceConfig,
): Promise<AppDependencies> {
    const connection = await getDBConnectionAsync();

    const orderBookService = new OrderBookService(connection);
    const userService = new UsersService(connection);
    const dealPriceService = new DealPriceService(connection);
    const tokenService = new TokenService(connection);
    const binanceService = new BinanceService(connection);
    const seedService = new SeedService(userService, tokenService, dealPriceService, orderBookService,  binanceService);
    const operationService = new OperationService();
    const websocketOpts = { path: SRA_PATH };

    return {
        // contractAddresses,
        connection,
        orderBookService,
        dealPriceService,
        userService,
        tokenService,
        seedService,
        operationService,
        websocketOpts
    };
}
