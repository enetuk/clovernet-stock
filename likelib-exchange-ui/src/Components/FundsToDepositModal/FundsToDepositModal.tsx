import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";
import { UserContext } from "../../Contexts/UserProvider";
import { useCopyText } from "../../hooks/useCopyText";
import { TokenPair } from "../../Utils/types";
import Button from "../Button/Button";
import Input from "../Input/Input";
import StyledModal from "../Modal/Modal";
import { ISelect } from "../Select";
import { TokenValueSelector } from "../TokenValueSelector";
import "./FundsToDepositModal.scss";

const LIKELIB_WALLET_ADDRESS = "TPQcfAMgKZKHR1VrLeoUvZPgdQkSR2ZZb8";
interface IFundsToDepositModal {
  token?: string;
  isOpen: boolean;
  onClose?(): void;
  onConfirm?(
    tokenName: string,
    tokenValue: string,
    selectedNetwork: string,
    address?: string
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
const FundsToDepositModal: React.FC<IFundsToDepositModal> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [token, setToken] = React.useState<{
    name: string;
    value: string;
  } | null>(null);
  const [isValid, setIsValid] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState<string>();
  const { activeTokenPair } = React.useContext(TokenPairContext);
  const [isTextCopied, setIsTextCopied] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [confirmAddressStep, setConfirmAddressStep] = React.useState(false);
  const { userBaseTokenBalance, userQuoteTokenBalance, user } =
    React.useContext(UserContext);
  const handleConfirm = () => {
    if (token && onConfirm && selectedNetwork) {
      onConfirm(token.name, token.value, selectedNetwork);
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
    } else setIsValid(false);
  };
  const handleNetworkSelect = ({
    selectedTokenValue,
  }: {
    selectedTokenValue: string;
  }) => {
    setSelectedNetwork(selectedTokenValue);
  };
  const handleCopyAddress = () => {
    useCopyText(address);
    setIsTextCopied(true);
  };
  const handleClose = () => {
    setIsTextCopied(false);
    setConfirmAddressStep(false);
    setIsProcessing(false);
    onClose && onClose();
  };
  const isConfirmable = token && onConfirm && selectedNetwork;
  React.useEffect(() => {
    if (user) {
      setAddress(LIKELIB_WALLET_ADDRESS || user.address);
    }
  }, []);

  return (
    <StyledModal isOpen={isOpen} onClose={handleClose}>
      <div className="FundsToDepositModal">
        <div className="FundsToDepositModal__Title">DEPOSIT CRYPTO</div>
        {confirmAddressStep ? (
          <>
            <div className="FundsToDepositModal__Address">
              <Input
                required={true}
                className="FundsToDepositModal__Address-Input"
                disabled={true}
                defaultValue={address}
              />
              <div onClick={handleCopyAddress}>
                {isTextCopied ? (
                  <>
                    <FontAwesomeIcon
                      className="FundsToDepositModal__Icon FundsToDepositModal__TextCopied"
                      icon={faCheck}
                    />
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      className="FundsToDepositModal__Icon FundsToDepositModal__TextCopyIcon"
                      icon={faCopy}
                    />
                  </>
                )}
              </div>
            </div>
            <ul>
              <li>Send only USDT to this deposit address</li>
              <li>Ensure the network is Tron (TRC20)</li>
            </ul>
          </>
        ) : (
          <>
            <TokenValueSelector
              title={"TOKEN"}
              showAvailableAmount={false}
              showMax={false}
              tokenList={transformToISelect(
                userBaseTokenBalance,
                userQuoteTokenBalance,
                activeTokenPair
              )}
              onTokenSelect={handleTokenSelect}
              disabled={isProcessing}
              noValidateAmount={true}
            />
            <br />
            <TokenValueSelector
              title={"NETWORK"}
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
              disabled={isProcessing}
            />
          </>
        )}
        {isProcessing && (
          <div className="FundsToDepositModal__ProcessingMessage">
            Your request to fill up deposit is processing, please wait
          </div>
        )}
        <div className="FundsToDepositModal__Controls">
          <Button
            background={"#3cb34f"}
            onClick={
              confirmAddressStep
                ? handleConfirm
                : () => setConfirmAddressStep(true)
            }
            disabled={!isValid || isProcessing || !isConfirmable}
          >
            {confirmAddressStep ? "Confirm" : "Deposit"}
          </Button>
        </div>
        {isProcessing && (
          <Button background={"#3cb34f"} onClick={handleClose}>
            Close
          </Button>
        )}
      </div>
    </StyledModal>
  );
};

export default FundsToDepositModal;
