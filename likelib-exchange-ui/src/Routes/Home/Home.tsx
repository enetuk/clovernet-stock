import React, { FC, useContext, useRef, useState } from "react";
import BuySell from "../../Components/BuySell/BuySell";
import Chart from "../../Components/Chart/Chart";
import { FundsToDepositModal } from "../../Components/FundsToDepositModal";
import OrderBook from "../../Components/OrderBook/OrderBook";
import OrderElements from "../../Components/OrderElements/OrderElements";
import WalletBalance from "../../Components/WalletBalance/WalletBalance";
import WalletLayout from "../../Components/WalletCreate/WalletLayout";
import { WithdrawModal } from "../../Components/WithdrawModal";
import "./Home.scss";
import { UserContext } from "../../Contexts/UserProvider";
import { Container } from "typedi";
import { OperationService } from "../../Services/OperationService";

const operationService = Container.get(OperationService);

const Home: FC<{ walletCreateOpen: boolean; onClose?(): void }> = ({
  walletCreateOpen,
  onClose,
}) => {
  const chartParentRef = useRef(null);
  const [fundToDeposit, setFundsToDeposit] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const { user } = useContext(UserContext);

  const onWithdrawConfirm = (
    tokenName: string,
    tokenValue: string,
    selectedNetwork: string,
    address: string
  ) => {
    if (user) {
      operationService.confirmWithdraw({
        amount: Number(tokenValue),
        currency: tokenName,
        internalID: user.address,
        network: selectedNetwork,
        address,
      });
    }
  };

  const onDepositConfirm = (
    tokenName: string,
    tokenValue: string,
    selectedNetwork: string
  ) => {
    if (user) {
      operationService.confirmDeposit({
        amount: Number(tokenValue),
        currency: tokenName,
        internalID: user.address,
        network: selectedNetwork,
      });
    }
  };

  return (
    <div className="dark-background">
      <div className="container">
        <div className={"Home-layout"}>
          <div className="Home-wallet">
            <WalletBalance
              onDepositClick={() => setFundsToDeposit(true)}
              onWithDrawClick={() => setWithdraw(true)}
            />
            <BuySell />
          </div>
          <div className="Home-orderbook">
            <OrderBook />
          </div>
          <div className="Home-chart" ref={chartParentRef}>
            <Chart parentRef={chartParentRef} />
            <OrderElements />
          </div>
        </div>
        <WalletLayout open={!Boolean(user?.address)} onClose={onClose} />
        <FundsToDepositModal
          isOpen={fundToDeposit}
          onClose={() => setFundsToDeposit(false)}
          onConfirm={onDepositConfirm}
        />
        <WithdrawModal
          isOpen={withdraw}
          onClose={() => setWithdraw(false)}
          onConfirm={onWithdrawConfirm}
        />
      </div>
    </div>
  );
};

export default Home;
