import { FC, useContext, useEffect } from "react";
import "./OrderBook.scss";
import { OrdersContext } from "../../Contexts/OrdersProvider";
import { useInterval } from "../../hooks";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";

const POLLING_TIMEOUT = 1000;

const OrderBook: FC = () => {
  const { orderBook, loadOrderBook } = useContext(OrdersContext);
  const { quoteToken } = useContext(TokenPairContext);

  useInterval(() => {
    loadOrderBook(1);
  }, POLLING_TIMEOUT);

  return (
    <div className="OrderBook">
      <h1 className="div-header">Orderbook</h1>

      <div className="table-index">
        <p className="trade-size">Trade size</p>
        <p className="price-weth">PRICE ({quoteToken?.symbol})</p>
        <p className="my-size">My Size</p>
      </div>

      <div className="trade-list">
        {orderBook.asks.records
          .slice()
          .reverse()
          .map((item, key) => (
            <div className="trade-list-item" key={key}>
              <div className="trade-size">
                <p>{item.size}</p>
              </div>
              <div className="price-weth">
                <p>{item.price}</p>
              </div>
              <div className="my-size">-</div>
            </div>
          ))}
      </div>
      <div
        style={{
          borderTop: "1px solid black",
          paddingTop: "10px",
          paddingBottom: "10px",
          marginBottom: 0,
        }}
        className="table-index"
      >
        <p className="trade-size">SPREAD</p>
        <p
          style={{ color: "white", fontSize: "14px" }}
          className="price-weth color-white"
        >
          {orderBook.spread}
        </p>
        <p style={{ color: "white", fontSize: "14px" }} className="my-size">
          {orderBook.percentageSpread}%
        </p>
      </div>
      <div className="trade-list">
        {orderBook.bids.records.map((item, key) => (
          <div className="trade-list-item" key={key}>
            <div className="trade-size">
              <p>{item.size}</p>
            </div>
            <div className="price-weth">
              <p style={{ color: "#3CB34F" }}>{item.price}</p>
            </div>
            <div className="my-size">-</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
