import { BigNumber } from '@0x/utils';

// tslint:disable:custom-no-magic-numbers

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const NULL_BYTES = '0x';
export const ZRX_DECIMALS = 18;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);
export const MAX_TOKEN_SUPPLY_POSSIBLE = new BigNumber(2).pow(256);
export const DEFAULT_LOCAL_POSTGRES_URI = 'postgres://api:api@localhost/api';
export const DEFAULT_LOGGER_INCLUDE_TIMESTAMP = true;
export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
export const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
export const DEFAULT_VALIDATION_GAS_LIMIT = 10e6;
export const HEX_BASE = 16;
export const PROTOCOL_FEE = 70e3;


// RFQM Service
export const KEEP_ALIVE_TTL = ONE_MINUTE_MS * 5;
export const RFQM_TRANSACTION_WATCHER_SLEEP_TIME_MS = ONE_SECOND_MS * 15;

// API namespaces
export const SRA_PATH = '/sra';
export const USERS_PATH = '/users'
export const PRICE_PATH = '/price';
export const TOKENS_PATH = '/tokens';
export const OPERATION_PATH = '/operation';

export const SWAP_PATH = '/swap/v1';
export const META_TRANSACTION_PATH = '/meta_transaction/v1';
export const METRICS_PATH = '/metrics';
export const RFQM_PATH = '/rfqm/v1';
export const API_KEY_HEADER = '0x-api-key';
export const HEALTHCHECK_PATH = '/healthz';

// Docs
export const SWAP_DOCS_URL = 'https://0x.org/docs/api#swap';
export const SRA_DOCS_URL = 'https://0x.org/docs/api#sra';
export const META_TRANSACTION_DOCS_URL = 'https://0x.org/docs/api#meta_transaction';



// General cache control
export const DEFAULT_CACHE_AGE_SECONDS = 1;
