/**
 * This module can be used to run the SRA HTTP service standalone
 */
import { cacheControl, createDefaultServer } from '@0x/api-utils';
import * as express from 'express';
// tslint:disable-next-line:no-implicit-dependencies
import * as core from 'express-serve-static-core';
import { Server } from 'http';

import { AppDependencies, getDefaultAppDependenciesAsync } from '../app';
import { defaultHttpServiceConfig } from '../config';
import {DEFAULT_CACHE_AGE_SECONDS, OPERATION_PATH, PRICE_PATH, SRA_PATH, TOKENS_PATH, USERS_PATH} from '../constants';
import { rootHandler } from '../handlers/root_handler';
import { logger } from '../logger';
import { errorHandler } from '../middleware/error_handling';
import { createSRARouter } from '../routers/sra_router';
import { HttpServiceConfig } from '../types';

import { destroyCallback } from './utils';
import {createUsersRouter} from "../routers/user_router";
import {createPriceRouter} from "../routers/price_router";
import {createTokenRouter} from "../routers/token_router";
import {createSeedRouter} from "../routers/seed_router";
import {createOperationRouter} from "../routers/operation_router";

process.on('uncaughtException', (err) => {
    logger.error(err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    if (err) {
        logger.error(err);
    }
});

if (require.main === module) {
    (async () => {
        // const provider = providerUtils.createWeb3Provider(defaultHttpServiceWithRateLimiterConfig.ethereumRpcUrl);
        const dependencies = await getDefaultAppDependenciesAsync(defaultHttpServiceConfig);
        await runHttpServiceAsync(dependencies, defaultHttpServiceConfig);
    })().catch((error) => logger.error(error.stack));
}

async function runHttpServiceAsync(
    dependencies: AppDependencies,
    config: HttpServiceConfig,
    _app?: core.Express,
): Promise<Server> {
    const app = _app || express();
    // app.use(addressNormalizer);
    app.use(cacheControl(DEFAULT_CACHE_AGE_SECONDS));
    const server = createDefaultServer(config, app, logger, destroyCallback(dependencies));

    app.get('/', rootHandler);
    // SRA http service
    app.use(`/api${SRA_PATH}`, createSRARouter(dependencies.orderBookService));
    // Users http service
    app.use(`/api${USERS_PATH}`, createUsersRouter(dependencies.userService));
    // Price http service
    app.use(`/api${PRICE_PATH}`, createPriceRouter(dependencies.dealPriceService));
    // Token http service
    app.use(`/api${TOKENS_PATH}`, createTokenRouter(dependencies.tokenService));
    // Operation http service
    app.use(`/api${OPERATION_PATH}`, createOperationRouter(dependencies.operationService));

    app.use(`/api/seed`, createSeedRouter(dependencies.seedService));
    app.use(errorHandler);

    // // websocket service
    // if (dependencies.meshClient) {
    //     // tslint:disable-next-line:no-unused-expression
    //     new WebsocketService(server, dependencies.meshClient, dependencies.websocketOpts);
    // } else {
    //     logger.error(`Could not establish mesh connection, exiting`);
    //     process.exit(1);
    // }

    server.listen(config.httpPort);
    return server;
}
