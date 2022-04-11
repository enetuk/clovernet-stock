import { BigNumber } from "@0x/utils";

export interface Token {
  id: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  displayDecimals: number;
}

export interface TokenPair {
  id: string;
  base: string;
  baseToken: Token;
  quote: string;
  quoteToken: Token;
}

export enum Network {
  Mainnet = 1,
  Rinkeby = 4,
  Kovan = 42,
  Ganache = 50,
}

export interface Order {
  chainId: number;
  exchangeAddress: string;
  makerAddress: string;
  takerAddress: string;
  feeRecipientAddress: string;
  senderAddress: string;
  makerAssetAmount: BigNumber;
  takerAssetAmount: BigNumber;
  makerFee: BigNumber;
  takerFee: BigNumber;
  expirationTimeSeconds: BigNumber;
  salt: BigNumber;
  makerAssetData: string;
  takerAssetData: string;
  makerFeeAssetData: string;
  takerFeeAssetData: string;
}

export interface SignedOrder extends Order {
  signature: string;
}

export enum OrderSide {
  Sell,
  Buy,
}

export interface UIOrder {
  hash: string;
  rawOrder: SignedOrder;
  side: OrderSide;
  size: BigNumber;
  filled: BigNumber | null;
  price: BigNumber;
  status: OrderStatus | null;
  createdAt: Date;
}

export interface UIOrderBook {
  bids: {
    total: number;
    records: UIOrderBookItem[];
  };
  asks: {
    total: number;
    records: UIOrderBookItem[];
  };
  spread: string;
  percentageSpread: string;
}

export interface UIOrderBookItem {
  rawOrder: SignedOrder;
  size: string;
  price: string;
}

export enum OrderStatus {
  Added = "ADDED",
  Filled = "FILLED",
  FullyFilled = "FULLY_FILLED",
  Cancelled = "CANCELLED",
  Expired = "EXPIRED",
}

export interface Signature {
  v: number;
  r: string;
  s: string;
  signatureType: number;
}

export interface NewOrder {
  makerToken: string;
  takerToken: string;
  makerAmount: BigNumber;
  takerAmount: BigNumber;
  maker: string;
  signature: Signature;
  expiry: BigNumber;
  salt: BigNumber;
  chainId: number;
  verifyingContract: string;
}
