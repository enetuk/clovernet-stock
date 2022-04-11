import React from "react";
import Input from "../Input/Input";
import { ISelect, StyledSelect } from "../Select";
import "./TokenValueSelector.scss";

interface ITokenValueSelector {
  title: string;
  tokenList?: ISelect[];
  hasTokenInput?: boolean;
  showAvailableAmount?: boolean;
  showMax?: boolean;
  onTokenSelect?(token: {
    name: string;
    value: string;
    selectedTokenValue: string;
    addressValue: string;
  }): void;
  showAddressInput?: boolean;
  tokenSelectorPlaceholder?: string;
  disabled?: boolean;
  noValidateAmount?: boolean;
}

const TokenValueSelector: React.FC<ITokenValueSelector> = ({
  title,
  tokenList,
  onTokenSelect,
  hasTokenInput = true,
  showAvailableAmount = true,
  tokenSelectorPlaceholder = "Select token",
  showAddressInput = false,
  disabled = false,
  noValidateAmount = false,
  showMax = true,
}) => {
  const [selectedToken, setSelectedToken] = React.useState<{
    label: string;
    value: string;
  }>();
  const [inputValue, setInputValue] = React.useState("");
  const [addressValue, setAddressValue] = React.useState("");

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !noValidateAmount &&
      selectedToken &&
      Number(e.target.value) > Number(selectedToken?.value)
    )
      return;
    Number(e.target.value) >= 0 && setInputValue(e.target.value);
  };

  const handleAddressValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressValue(e.target.value);
  };

  const handleMaxClick = () => {
    selectedToken && setInputValue(selectedToken.value);
  };

  const handleSelectChange = (selected: ISelect) => {
    setSelectedToken({ value: selected.value, label: selected.label });
  };
  React.useEffect(() => {
    onTokenSelect &&
      selectedToken &&
      onTokenSelect({
        name: selectedToken.label,
        value: inputValue,
        selectedTokenValue: selectedToken.value,
        addressValue,
      });
  }, [inputValue, selectedToken, addressValue]);

  return (
    <div className="TokenValueSelector">
      <div className="TokenValueSelector__Title">{title}</div>
      <StyledSelect
        options={tokenList}
        onChange={(value) => handleSelectChange(value as ISelect)}
        isMulti={false}
        isOptionSelected={(option: unknown, selectValue: unknown) =>
          (option as ISelect).label === (selectValue as ISelect).label
        }
        isSearchable={false}
        placeholder={tokenSelectorPlaceholder}
        isDisabled={disabled}
      />
      {hasTokenInput && (
        <div className="TokenValueSelector__TokenInput">
          <Input
            onChange={handleChangeInput}
            defaultValue={inputValue}
            value={inputValue}
            onlyNumbers={true}
            disabled={disabled}
          />
          {showMax && (
            <span
              className="TokenValueSelector__MaxLabel"
              onClick={handleMaxClick}
            >
              Max
            </span>
          )}
        </div>
      )}
      {showAddressInput && (
        <div className="TokenValueSelector__TokenInput">
          <Input
            onChange={handleAddressValueChange}
            value={addressValue}
            placeholder={"Enter your address"}
            disabled={disabled}
          />
        </div>
      )}
      {showAvailableAmount && selectedToken && (
        <div className="TokenValueSelector__AvailableAmount">
          <span className={"TokenValueSelector__Available"}>Available: </span>{" "}
          {selectedToken.value} {selectedToken.label.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default TokenValueSelector;
