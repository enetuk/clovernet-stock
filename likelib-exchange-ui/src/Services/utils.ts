import BigNumber from "bignumber.js";
import { OrderSide, Token, UIOrder, UIOrderBookItem } from "../Utils/types";
import { tokenAmountInUnits } from "../Utils/tokens";
import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from "../Utils/constants";

export const ordersToUIOrdersWithoutOrderInfo = (
  orders: any[],
  baseToken: Token
): UIOrder[] => {
  return orders.map(({ order, metaData }, i) => {
    const side =
      order.takerToken === baseToken.address ? OrderSide.Buy : OrderSide.Sell;
    const size =
      side === OrderSide.Sell ? order.makerAmount : order.takerAmount;
    order.takerAmount = new BigNumber(order.takerAmount);
    order.makerAmount = new BigNumber(order.makerAmount);
    metaData.remainingFillableTakerAmount = new BigNumber(
      metaData.remainingFillableTakerAmount
    );
    const filled =
      side === OrderSide.Sell
        ? metaData.remainingFillableTakerAmount
        : order.takerAmount.minus(metaData.remainingFillableTakerAmount);
    const status = metaData.state;
    const price =
      side === OrderSide.Sell
        ? order.takerAmount.div(order.makerAmount)
        : order.makerAmount.div(order.takerAmount);
    const createdAt = new Date(metaData.createdAt);

    return {
      hash: metaData.orderHash,
      rawOrder: order,
      side,
      size,
      filled,
      price,
      status,
      createdAt,
    };
  });
};

export const orderBookToUiOrderBook = (
  orders: any[],
  baseToken: Token
): UIOrderBookItem[] => {
  return orders.map(({ order, metaData }) => {
    const side =
      order.takerToken === baseToken.address ? OrderSide.Buy : OrderSide.Sell;

    order.takerAmount = new BigNumber(order.takerAmount);
    order.makerAmount = new BigNumber(order.makerAmount);
    metaData.remainingFillableTakerAmount = new BigNumber(
      metaData.remainingFillableTakerAmount
    );
    const price =
      side === OrderSide.Sell
        ? order.takerAmount.div(order.makerAmount)
        : order.makerAmount.div(order.takerAmount);

    const size =
      side === OrderSide.Sell
        ? metaData.remainingFillableTakerAmount.dividedBy(price)
        : metaData.remainingFillableTakerAmount;

    return {
      rawOrder: order,
      size: tokenAmountInUnits(
        new BigNumber(size),
        baseToken.decimals,
        baseToken.displayDecimals
      ),
      price: parseFloat(price.toString()).toFixed(
        UI_DECIMALS_DISPLAYED_PRICE_ETH
      ),
    };
  });
};
