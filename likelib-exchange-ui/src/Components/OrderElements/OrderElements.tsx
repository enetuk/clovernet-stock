import React, { FC, useContext, useEffect, useState } from "react";
import "./OrderElements.scss";
import SingleOrder from "./SingleOrder";
import Pagination from "../Pagination/Pagination";
import { OrdersContext } from "../../Contexts/OrdersProvider";
import { DEFAULT_ORDERS_PER_PAGE } from "../../Services/OrdersService";
import { useInterval } from "../../hooks";
import clsx from "clsx";
import { UIOrder } from "../../Utils/types";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";
const POLLING_TIMEOUT = 1000;
export enum OrderElementType {
  OPEN_ORDERS = "Open orders",
  HISTORY = "History",
}

const OrderElements: FC = () => {
  const { baseToken, quoteToken } = useContext(TokenPairContext);
  const [activePage, setActivePage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState(OrderElementType.OPEN_ORDERS);
  const { orders, loadOrders, totalOrders, cancelOrder } =
    useContext(OrdersContext);

  useEffect(() => {
    loadOrders(activePage, activeTab !== OrderElementType.OPEN_ORDERS);
  }, []);

  useEffect(() => {
    loadOrders(activePage, activeTab !== OrderElementType.OPEN_ORDERS);
  }, [activePage]);

  useEffect(() => {
    loadOrders(activePage, activeTab !== OrderElementType.OPEN_ORDERS);
  }, [activeTab]);

  useInterval(() => {
    loadOrders(activePage, activeTab !== OrderElementType.OPEN_ORDERS);
  }, POLLING_TIMEOUT);

  const handleTabClick = (tab: OrderElementType) => () => {
    setActiveTab(tab);
  };
  const handleCancelClick = (id: string): Promise<string> => {
    return new Promise((res, rej) => {
      cancelOrder(id)
        .then(() => {
          res(id);
          loadOrders(activePage, activeTab !== OrderElementType.OPEN_ORDERS);
        })
        .catch(rej);
    });
  };
  useEffect(() => {
    setActiveTab(OrderElementType.OPEN_ORDERS);
  }, [quoteToken, baseToken]);

  const renderRows = (orders: UIOrder[]) =>
    orders.map(
      ({ hash, size, price, side, filled, status, createdAt }, key) => (
        <SingleOrder
          hash={hash}
          size={size as any}
          price={price as any}
          side={side}
          filled={filled}
          key={key}
          baseToken={baseToken}
          status={status as any}
          isOrderFillable={false}
          createdAt={createdAt}
          onCancelOrder={handleCancelClick}
          cancelable={activeTab === OrderElementType.OPEN_ORDERS}
        />
      )
    );

  return (
    <div className="Order-Elements">
      <div className="table-tabs">
        <div
          className={clsx("tab open", {
            ["non-active"]: activeTab !== OrderElementType.OPEN_ORDERS,
          })}
          onClick={handleTabClick(OrderElementType.OPEN_ORDERS)}
        >
          Open orders
        </div>
        <div
          className={clsx("tab history", {
            ["non-active"]: activeTab !== OrderElementType.HISTORY,
          })}
          onClick={handleTabClick(OrderElementType.HISTORY)}
        >
          History
        </div>
      </div>
      {orders?.length ? (
        <>
          <div className="header-table">
            <h1>SIDE</h1>
            <h1>TOTAL</h1>
            <h1>FILLED</h1>
            <h1>PRICE</h1>
            <h1>STATUS</h1>
            <h1>CREATED AT</h1>
          </div>
          {renderRows(orders)}
          {totalOrders && (
            <Pagination
              style={{}}
              active={activePage}
              perpage={DEFAULT_ORDERS_PER_PAGE}
              total={totalOrders}
              setactive={setActivePage}
            />
          )}
        </>
      ) : (
        <p style={{ height: "100%" }}>There are no orders to show</p>
      )}
    </div>
  );
};

export default OrderElements;
