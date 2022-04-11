import {ConnectionOptions} from 'typeorm';

import {
  SignedOrderV4Entity,
  UserEntity,
  DealPriceEntity,
  TokenEntity,
  TokenPairEntity,
  UserBalanceEntity
} from './entities';
import {POSTGRES_READ_REPLICA_URIS, POSTGRES_URI} from "./config";

const entities = [
  SignedOrderV4Entity,
  UserEntity,
  DealPriceEntity,
  TokenEntity,
  TokenPairEntity,
  UserBalanceEntity
];

const config: ConnectionOptions = {
    type: 'postgres',
    entities,
    synchronize: true,
    logging: false,
    extra: {
        max: 15,
        statement_timeout: 10000,
    },
    migrations: ['./lib/migrations/*.js'],
    ...(POSTGRES_READ_REPLICA_URIS
        ? {
              replication: {
                  master: { url: POSTGRES_URI },
                  slaves: POSTGRES_READ_REPLICA_URIS.map((r) => ({ url: r })),
              },
          }
        : { url: POSTGRES_URI }),
    cli: {
        migrationsDir: 'migrations',
    },
};
module.exports = config;
