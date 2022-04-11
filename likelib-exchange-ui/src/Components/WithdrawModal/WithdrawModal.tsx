import React from "react";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";
import { UserContext } from "../../Contexts/UserProvider";
import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from "../../Utils/constants";
import { TokenPair } from "../../Utils/types";
import Button from "../Button/Button";
import StyledModal from "../Modal/Modal";
import { ISelect } from "../Select";
import { TokenValueSelector } from "../TokenValueSelector";
import "./WithdrawModal.scss";

interface IWithdrawModal {
  token?: string;
  isOpen: boolean;
  onClose?(): void;
  onConfirm?(
    tokenName: string,
    tokenValue: string,
    selectedNetwork: string,
    address: string
  ): void;
}
const transformToISelect = (
  baseTokenBalance: string,
  quoteTokenBalance: string,
  token?: TokenPair
): ISelect[] => {
  if (!token) {
    return [];
  }
  return [{ label: token.quoteToken.symbol, value: quoteTokenBalance }];
};
const WithdrawModal: React.FC<IWithdrawModal> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [token, setToken] = React.useState<{
    name: string;
    value: string;
  } | null>(null);
  const [isValid, setIsValid] = React.useState(false);
  const [withdrawalAddress, setWithdrawalAddress] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState<string>();
  const { activeTokenPair } = React.useContext(TokenPairContext);
  const [fee, setFee] = React.useState<string>();
  const [receiveValue, setReceiveValue] = React.useState<string>();
  const { userBaseTokenBalance, userQuoteTokenBalance, user } =
    React.useContext(UserContext);
  const handleConfirm = () => {
    if (token && onConfirm && selectedNetwork) {
      onConfirm(token.name, token.value, selectedNetwork, withdrawalAddress);
      setIsProcessing(true);
    }
  };
  const handleTokenSelect = (selectedValue: {
    name: string;
    value: string;
  }) => {
    if (selectedValue.name && Number(selectedValue.value)) {
      setIsValid(true);
      setToken(selectedValue);
    } else {
      setIsValid(false);
      setFee("");
    }
  };

  const handleNetworkSelect = ({
    selectedTokenValue,
    addressValue,
  }: {
    selectedTokenValue: string;
    addressValue: string;
  }) => {
    setSelectedNetwork(selectedTokenValue);
    setWithdrawalAddress(addressValue);
  };

  const handleClose = () => {
    onClose && onClose();
    setFee("");
  };

  const isConfirmable =
    token && onConfirm && selectedNetwork && withdrawalAddress;

  React.useEffect(() => {
    if (Number(token?.value)) {
      const feeAmount = Number(token?.value) * 0.1;
      const valueMinusFee = Number(token?.value) - feeAmount;
      const formattedFee = feeAmount.toFixed(UI_DECIMALS_DISPLAYED_PRICE_ETH);
      const formattedValueMinusFee = valueMinusFee.toFixed(
        UI_DECIMALS_DISPLAYED_PRICE_ETH
      );
      setFee(formattedFee);
      setReceiveValue(formattedValueMinusFee);
    }
  }, [token]);

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <div className="WithdrawModal">
        <div className="WithdrawModal__Title">WITHDRAW CRYPTO </div>
        <TokenValueSelector
          title={"TOKEN"}
          tokenList={transformToISelect(
            userBaseTokenBalance,
            userQuoteTokenBalance,
            activeTokenPair
          )}
          onTokenSelect={handleTokenSelect}
          disabled={isProcessing}
        />
        <TokenValueSelector
          title={"WITHDRAWAL ADDRESS"}
          tokenList={[
            {
              label: "TRX Tron (TRC20)",
              value: "tron",
            },
          ]}
          onTokenSelect={handleNetworkSelect}
          hasTokenInput={false}
          tokenSelectorPlaceholder={"Select network"}
          showAvailableAmount={false}
          showAddressInput
          disabled={isProcessing}
        />
        {Boolean(fee) && (
          <>
            <div className="WithdrawModal__ProcessingMessage">
              Fee (10%): {fee} {token?.name}
            </div>
            <div className="WithdrawModal__ProcessingMessage">
              You&apos;ll receive: {receiveValue} {token?.name}
            </div>
          </>
        )}
        <div className="WithdrawModal__Controls">
          <Button
            background={"#3cb34f"}
            onClick={handleConfirm}
            disabled={!isValid || isProcessing || !isConfirmable}
          >
            Withdraw
          </Button>
        </div>
        {isProcessing && (
          <div className="WithdrawModal__ProcessingMessage">
            Your request for withdrawal is processing, please wait
          </div>
        )}
      </div>
    </StyledModal>
  );
};

export default WithdrawModal;
