import React, { FC, useContext, useEffect, useState } from "react";
import "./BuySell.scss";
import { Container } from "typedi";
import { OrdersService } from "../../Services/OrdersService";
import { BigNumber } from "@0x/utils";
import { UserContext } from "../../Contexts/UserProvider";
import cx from "clsx";
import { OrdersContext } from "../../Contexts/OrdersProvider";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";
import StyledModal from "../Modal/Modal";
import Button from "../Button/Button";

export enum OrderBuySellType {
  BUY = "Buy",
  SELL = "Sell",
}

export enum OrderType {
  MARKET = "Market",
  LIMIT = "Limit",
}

const ordersService = Container.get(OrdersService);

interface PopUpContentProps {
  submit: () => void;
  cancel: () => void;
  amount: string;
  price: string;
  cost: string;
}

const PopUpContent: React.FC<PopUpContentProps> = ({
  submit,
  cancel,
  amount,
  price,
  cost,
}) => {
  return (
    <div>
      <div className="title">Approve</div>
      <div
        style={{ flexDirection: "column", fontFamily: "Roboto" }}
        className="modal-content BuySell-ModalMessage"
      >
        Are you sure to submit this order ?
        <div className="BuySell-ModalMessageParametersWrapper">
          <ul>
            <li>Amount: {amount}</li>
            <li>Price: {price}</li>
            <li>Cost: {cost}</li>
          </ul>
        </div>
      </div>
      <div className={"controls"}>
        <Button background={"#3cb34f"} onClick={submit}>
          Submit
        </Button>
        <Button background={"none"} onClick={cancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const BuySell: FC = () => {
  const [activeState, setActiveState] = useState<OrderBuySellType>(
    OrderBuySellType.BUY
  );
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [token1Value, setToken1Value] = useState<string>("");
  const [pricePerToken, setPricePerToken] = useState<string>("");
  const [cost, setCost] = useState<string>("0");

  const { user } = useContext(UserContext);
  const { buyOrderPrice, sellOrderPrice } = useContext(OrdersContext);
  const { userBaseTokenBalance, userQuoteTokenBalance } =
    useContext(UserContext);
  const { baseToken, quoteToken } = useContext(TokenPairContext);
  const [popupContent, setPopUpContent] = useState<React.ReactNode | null>();
  const [popupIsOpen, setPopUpIsOpen] = useState(false);
  const [buySellBtnEnabled, setBuySellBtnEnabled] = useState(false);

  const openPopUp = (callback: () => void, price: string) => {
    setPopUpIsOpen(true);
    setPopUpContent(
      <PopUpContent
        submit={callback}
        amount={token1Value}
        cost={cost}
        price={price}
        cancel={() => setPopUpIsOpen(false)}
      />
    );
  };

  const submitOrder = async () => {
    if (
      orderType === OrderType.LIMIT &&
      Number(token1Value) &&
      Number(pricePerToken)
    ) {
      let takerAmount: BigNumber | undefined;
      let makerAmount: BigNumber | undefined;
      if (activeState === OrderBuySellType.SELL) {
        makerAmount = new BigNumber(token1Value);
        takerAmount = makerAmount.multipliedBy(pricePerToken);
      } else {
        takerAmount = new BigNumber(token1Value);
        makerAmount = takerAmount.multipliedBy(pricePerToken);
      }
      openPopUp(async () => {
        await ordersService.addOrder(
          activeState,
          makerAmount!,
          takerAmount!,
          baseToken.address,
          quoteToken.address,
          user?.address as string
        );

        resetState();
        setPopUpIsOpen(false);
      }, pricePerToken);
    } else if (orderType === OrderType.MARKET) {
      let takerAmount: BigNumber | undefined;
      let makerAmount: BigNumber | undefined;
      let price = "";

      if (activeState === OrderBuySellType.SELL && Number(sellOrderPrice)) {
        makerAmount = new BigNumber(token1Value);
        takerAmount = makerAmount.multipliedBy(Number(sellOrderPrice));
        price = sellOrderPrice;
      }

      if (activeState === OrderBuySellType.BUY && Number(buyOrderPrice)) {
        takerAmount = new BigNumber(token1Value);
        makerAmount = takerAmount.multipliedBy(buyOrderPrice);
        price = buyOrderPrice;
      }

      if (takerAmount && makerAmount) {
        openPopUp(async () => {
          await ordersService.addOrder(
            activeState,
            makerAmount!,
            takerAmount!,
            baseToken.address,
            quoteToken.address,
            user?.address as string
          );

          resetState();
          setPopUpIsOpen(false);
        }, price);
      }
    }
  };

  const resetState = () => {
    setToken1Value("0");
    setCost("0");
    setPricePerToken("0");
    setBuySellBtnEnabled(false);
  };

  useEffect(() => {
    resetState();
  }, [activeState, orderType]);

  useEffect(() => {
    if (OrderType.MARKET === orderType) {
      if (activeState === OrderBuySellType.BUY) {
        if (!Number(buyOrderPrice) || !token1Value) {
          setBuySellBtnEnabled(false);
          return;
        }
        const cost = new BigNumber(buyOrderPrice).multipliedBy(token1Value);
        setCost(cost.toString());
        setBuySellBtnEnabled(cost.lte(new BigNumber(userQuoteTokenBalance)));
      } else {
        if (!Number(sellOrderPrice) || !token1Value) {
          setBuySellBtnEnabled(false);
          return;
        }
        const cost = new BigNumber(sellOrderPrice).multipliedBy(token1Value);
        setCost(cost.toString());
        setBuySellBtnEnabled(
          new BigNumber(token1Value).lte(new BigNumber(userBaseTokenBalance))
        );
      }

      return;
    }

    if (OrderType.LIMIT === orderType) {
      if (
        pricePerToken &&
        token1Value &&
        Number(pricePerToken) &&
        Number(token1Value)
      ) {
        setCost(
          new BigNumber(token1Value).multipliedBy(pricePerToken).toString()
        );
      } else {
        setCost("0");
      }
    }

    if (OrderBuySellType.BUY === activeState && userQuoteTokenBalance) {
      if (!Number(token1Value) || !Number(pricePerToken)) {
        setBuySellBtnEnabled(false);
        return;
      }

      setBuySellBtnEnabled(
        new BigNumber(pricePerToken)
          .multipliedBy(token1Value)
          .lte(new BigNumber(userQuoteTokenBalance))
      );
    }

    if (OrderBuySellType.SELL === activeState && userBaseTokenBalance) {
      if (
        OrderType.LIMIT === orderType &&
        (!Number(pricePerToken) || !Number(token1Value))
      ) {
        setBuySellBtnEnabled(false);
        return;
      }
      setBuySellBtnEnabled(
        new BigNumber(token1Value).lte(userBaseTokenBalance)
      );
    }
  }, [token1Value, pricePerToken]);

  return (
    <div className="BuySell">
      <StyledModal
        isOpen={popupIsOpen}
        onClose={() => {
          setPopUpIsOpen(false);
        }}
      >
        {popupContent}
      </StyledModal>
      <div className="active-bar">
        <h1
          onClick={() => setActiveState(OrderBuySellType.BUY)}
          className={
            activeState === OrderBuySellType.BUY
              ? "active-item"
              : "non-active-item"
          }
        >
          Buy
        </h1>
        <h1
          onClick={() => setActiveState(OrderBuySellType.SELL)}
          className={
            activeState === OrderBuySellType.SELL
              ? "active-item sell"
              : "non-active-item"
          }
        >
          Sell
        </h1>
      </div>
      <div className="head-bar">
        <p>Amount</p>
        <p>
          <span
            onClick={() => setOrderType(OrderType.MARKET)}
            className={orderType === OrderType.MARKET ? "active-item" : ""}
          >
            Market
          </span>{" "}
          <span> /</span>{" "}
          <span
            onClick={() => setOrderType(OrderType.LIMIT)}
            className={orderType === OrderType.LIMIT ? "active-item" : ""}
          >
            Limit
          </span>
        </p>
      </div>

      <div className="input-amount">
        <div className="form-container">
          <input
            value={token1Value}
            required
            type={"text"}
            onChange={(e) => {
              Number(e.target.value) >= 0 && setToken1Value(e.target.value);
            }}
          />
          <p>{baseToken?.symbol}</p>
        </div>
        {orderType === OrderType.LIMIT ? (
          <>
            <p className="title">Price per token</p>
            <div className="form-container">
              <input
                value={pricePerToken}
                required
                onChange={(e) => {
                  Number(e.target.value) >= 0 &&
                    setPricePerToken(e.target.value);
                }}
              />
              <p>{quoteToken?.symbol}</p>
            </div>
          </>
        ) : null}
      </div>

      <div className="order-details">
        <h1 className="header-order-details">Order Details</h1>
        <div className="order-fee">
          <p className="fee">Fee</p>
          <p className="fee-order">0.00</p>
        </div>
      </div>

      <div className="order-details">
        <div style={{ border: "none" }} className="order-fee">
          <p className="fee">Cost</p>
          <p className="fee-order">
            {cost} {quoteToken?.symbol}
          </p>
        </div>
      </div>
      <button
        onClick={() => submitOrder()}
        className={cx("button-buy-mkr", {
          ["sell"]: activeState !== OrderBuySellType.BUY,
          ["disabled"]: !buySellBtnEnabled,
        })}
        disabled={!buySellBtnEnabled}
      >
        {activeState} {baseToken?.symbol}
      </button>
    </div>
  );
};

export default BuySell;
