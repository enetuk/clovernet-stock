import { Service } from "typedi";
import { BACKEND_URL } from "../Common/constants";
import axios, { AxiosResponse } from "axios";
import {
  orderBookToUiOrderBook,
  ordersToUIOrdersWithoutOrderInfo,
} from "./utils";
import { NewOrder, Token, UIOrder, UIOrderBook } from "../Utils/types";
import { BigNumber, hexUtils } from "@0x/utils";
import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from "../Utils/constants";
import { OrderBuySellType } from "../Components/BuySell/BuySell";

const SRA_URL = `${BACKEND_URL}/sra`;
export const DEFAULT_ORDERS_PER_PAGE = 5;
export const DEFAULT_ORDERS_BOOK_PER_PAGE = 50;
export const MOCK_SIGNATURE = { v: 0, r: "0", s: "0", signatureType: 0 };
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export interface OrderBookResponse {
  bids: OrderBookResponseItem;
  asks: OrderBookResponseItem;
}

export interface OrderBookResponseItem {
  page: number;
  perPage: number;
  records: any[];
  total: number;
}

@Service()
export class OrdersService {
  public async getOrders(
    page: number,
    maker: string,
    baseToken: Token,
    quoteToken: Token,
    perPage = DEFAULT_ORDERS_PER_PAGE,
    unfillable = false
  ): Promise<{ orders: UIOrder[]; total: number }> {
    let params: any = { page: page, perPage, maker, unfillable };
    if (baseToken) {
      params = { ...params, makerToken: baseToken.address };
    }
    if (quoteToken) {
      params = { ...params, takerToken: quoteToken.address };
    }

    return axios
      .get<any, AxiosResponse<{ records: any; total: number }>>(
        `${SRA_URL}/orders`,
        { params }
      )
      .then(({ data }) => {
        const { records, total } = data;

        return {
          orders: ordersToUIOrdersWithoutOrderInfo(records, baseToken),
          total,
        };
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async addOrder(
    type: OrderBuySellType,
    makerAmount: BigNumber,
    takerAmount: BigNumber,
    baseToken: string,
    quoteToken: string,
    maker: string
  ): Promise<void> {
    const makerToken: string =
      type === OrderBuySellType.BUY ? quoteToken : baseToken;
    const takerToken: string =
      type === OrderBuySellType.BUY ? baseToken : quoteToken;
    const newOrder: NewOrder = {
      makerToken,
      takerToken,
      makerAmount: makerAmount.multipliedBy(new BigNumber(10).pow(18)),
      takerAmount: takerAmount.multipliedBy(new BigNumber(10).pow(18)),
      maker,
      signature: MOCK_SIGNATURE,
      expiry: new BigNumber(2524604400), // Close to infinite
      salt: new BigNumber(hexUtils.random()),
      chainId: 42,
      verifyingContract: NULL_ADDRESS,
    };

    const resp = await axios.post<NewOrder, AxiosResponse<NewOrder>>(
      `${SRA_URL}/order`,
      newOrder
    );
  }

  public async getOrderBook(
    baseToken: Token,
    quoteToken: Token,
    page: number,
    perPage = DEFAULT_ORDERS_BOOK_PER_PAGE
  ): Promise<UIOrderBook> {
    const orderBook = await axios.get<any, AxiosResponse<OrderBookResponse>>(
      `${SRA_URL}/orderbook`,
      {
        params: {
          baseToken: baseToken.address,
          quoteToken: quoteToken.address,
          page,
          perPage,
        },
      }
    );
    const { bids, asks } = orderBook.data;
    const bidRecords = orderBookToUiOrderBook(bids.records, baseToken);
    const askRecords = orderBookToUiOrderBook(asks.records, baseToken);
    const spread =
      bidRecords.length && askRecords.length
        ? new BigNumber(askRecords[0].price).minus(bidRecords[0].price)
        : new BigNumber(0);
    const percentageSpread = askRecords.length
      ? spread.dividedBy(new BigNumber(askRecords[0].price)).multipliedBy(100)
      : new BigNumber(0);

    return {
      bids: {
        total: bids.total,
        records: bidRecords,
      },
      asks: {
        total: asks.total,
        records: askRecords,
      },
      spread: parseFloat(spread.toString()).toFixed(
        UI_DECIMALS_DISPLAYED_PRICE_ETH
      ),
      percentageSpread: parseFloat(percentageSpread.toString()).toFixed(2),
    };
  }

  public async cancelOrder(hash: string): Promise<string> {
    await axios.post(`${SRA_URL}/cancel`, null, { params: { hash } });
    return hash;
  }
}
