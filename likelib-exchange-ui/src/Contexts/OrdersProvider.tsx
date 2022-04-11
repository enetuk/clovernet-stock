import React, { useContext, useEffect, useState } from "react";
import { Container } from "typedi";
import {
  DEFAULT_ORDERS_PER_PAGE,
  OrdersService,
} from "../Services/OrdersService";
import { UIOrder, UIOrderBook } from "../Utils/types";
import { UserContext } from "./UserProvider";
import { TokenPairContext } from "./TokenPairProvider";

interface OrdersContextProps {
  orders: UIOrder[];
  orderBook: UIOrderBook;
  loadOrders(activePage: number, isUnfillable?: boolean): void;
  loadOrderBook(activePage: number): void;
  cancelOrder(id: string): Promise<string>;
  sellOrderPrice: string;
  buyOrderPrice: string;
  totalOrders: number;
  totalOrderBook: number;
}

export const OrdersContext = React.createContext<OrdersContextProps>(
  undefined as any
);

const ordersService = Container.get(OrdersService);
const INITIAL_ORDER_BOOK_STATE: UIOrderBook = {
  bids: { total: 0, records: [] },
  asks: { total: 0, records: [] },
  spread: "0",
  percentageSpread: "0",
};

export const OrdersProvider: React.FC = ({ children }) => {
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [orderBook, setOrderBook] = useState<UIOrderBook>(
    INITIAL_ORDER_BOOK_STATE
  );
  const { user } = useContext(UserContext);

  const [total, setTotal] = useState<number>(0);
  const [totalOrderBook, setTotalOrderBook] = useState<number>(0);
  const [sellOrderPrice, setSellOrderPrice] = useState("0");
  const [buyOrderPrice, setBuyOrderPrice] = useState("0");
  const { baseToken, quoteToken } = useContext(TokenPairContext);

  useEffect(() => {
    if (orderBook.asks.records.length) {
      setBuyOrderPrice(orderBook.asks.records[0].price);
    }
    if (orderBook.bids.records.length) {
      setSellOrderPrice(orderBook.bids.records[0].price);
    }
  }, [orderBook]);

  useEffect(() => {
    loadOrderBook(1);
    loadOrders(1, false);
  }, [baseToken, quoteToken]);

  const loadOrders = (activePage: number, isUnfillable: boolean) => {
    if (user && baseToken && quoteToken) {
      ordersService
        .getOrders(
          activePage,
          user.address,
          baseToken,
          quoteToken,
          DEFAULT_ORDERS_PER_PAGE,
          isUnfillable
        )
        .then(({ orders, total }) => {
          setOrders(orders);
          setTotal(total);
        });
    } else if (!user) {
      setOrders([]);
    }
  };

  const loadOrderBook = (activePage: number) => {
    if (baseToken && quoteToken) {
      ordersService
        .getOrderBook(baseToken, quoteToken, activePage)
        .then((orderbook) => {
          setOrderBook(orderbook);
        });
    }
  };

  const cancelOrder = (id: string): Promise<string> =>
    ordersService.cancelOrder(id);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loadOrders,
        loadOrderBook,
        cancelOrder,
        sellOrderPrice,
        buyOrderPrice,
        totalOrders: total,
        orderBook,
        totalOrderBook,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};
