import { OrderStatus, Token } from "../../Utils/types";
import { FC, useState } from "react";
import { tokenAmountInUnits } from "../../Utils/tokens";
import BigNumber from "bignumber.js";
import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from "../../Utils/constants";
import { ORDER_STATUSES } from "../../Utils/ui";
import "./SingleOrder.scss";
import clsx from "clsx";

export interface ISingleOrder {
  hash: string;
  size: string;
  price: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filled: any | null;
  side: number;
  baseToken: Token;
  status: OrderStatus;
  isOrderFillable: boolean;
  createdAt: Date;
  onCancelOrder?(id: string): Promise<string>;
  cancelable?: boolean;
}
const SingleOrder: FC<ISingleOrder> = ({
  hash,
  size,
  price,
  filled,
  side,
  baseToken,
  status,
  createdAt,
  onCancelOrder,
  cancelable,
}) => {
  const asize = tokenAmountInUnits(
    new BigNumber(size),
    baseToken.decimals,
    baseToken.displayDecimals
  );
  const [cancelingOrderInProgress, setCancelingOrderInProgress] =
    useState(false);
  const aprice = parseFloat(price.toString()).toFixed(
    UI_DECIMALS_DISPLAYED_PRICE_ETH
  );
  const afilled = filled
    ? tokenAmountInUnits(filled, baseToken.decimals, baseToken.displayDecimals)
    : null;

  const aside = side ? "BUY" : "SELL";
  const handleCancelOrder = (id: string) => () => {
    setCancelingOrderInProgress(true);
    onCancelOrder &&
      onCancelOrder(id).finally(() => setCancelingOrderInProgress(false));
  };
  return (
    <div
      className={clsx("singleOrderItem", {
        ["disabled"]: cancelingOrderInProgress,
      })}
    >
      <h1
        style={{
          color: aside === "BUY" ? "rgb(60, 179, 79)" : "rgb(255, 101, 52)",
        }}
      >
        {aside}
      </h1>
      <h1>{asize}</h1>
      <h1>{afilled ? afilled : "0.00"}</h1>
      <h1>{aprice}</h1>
      <h1 style={{ color: ORDER_STATUSES[status].color }}>
        {ORDER_STATUSES[status].text}
        {cancelable && (
          <button
            className="cancel-btn"
            onClick={handleCancelOrder(hash)} // TODO: provide correct order ID
            disabled={cancelingOrderInProgress}
          >
            Cancel
          </button>
        )}
      </h1>
      <h1>{`${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`}</h1>
    </div>
  );
};

export default SingleOrder;
