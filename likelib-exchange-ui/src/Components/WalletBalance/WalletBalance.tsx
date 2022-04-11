import { FC, useContext } from "react";
import "./WalletBalance.scss";
import { UserContext } from "../../Contexts/UserProvider";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";
import { Label } from "../Label";

const WalletBalance: FC<{ onDepositClick(): void; onWithDrawClick(): void }> =
  ({ onDepositClick, onWithDrawClick }) => {
    const { userBaseTokenBalance, userQuoteTokenBalance, user } =
      useContext(UserContext);
    const { baseToken, quoteToken } = useContext(TokenPairContext);

    return (
      <div className="WalletBalance">
        <div className="WalletBalance__Head div-header">
          <span>Wallet balance</span>
          {user?.address && (
            <>
              <Label color={"#f57c00"} onClick={onDepositClick}>
                Deposit
              </Label>
              <Label color={""} onClick={onWithDrawClick}>
                Withdraw
              </Label>
            </>
          )}
        </div>
        <div className="mkr-balance">
          <p>{baseToken?.symbol}</p>
          <p>{userBaseTokenBalance}</p>
        </div>
        <div className="mkr-balance">
          <p>{quoteToken?.symbol}</p>
          <p>{userQuoteTokenBalance}</p>
        </div>
      </div>
    );
  };

export default WalletBalance;
