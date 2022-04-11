import React, { useEffect, useState } from "react";
import { useCopyText } from "../../../hooks/useCopyText";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import "./CreateWallet.scss";
import * as LikeLib from "@likelib/core";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ICreateWAllet {
  onWalletDataChange(
    privateKey: string,
    password: string,
    address: string
  ): void;
  setIsValid(isValid: boolean): void;
}
const CreateWallet: React.FC<ICreateWAllet> = ({
  setIsValid,
  onWalletDataChange,
}) => {
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [firstPass, setFirstPass] = useState("");
  const [secondPass, setSecondPass] = useState("");
  const [isTextCopied, setIsTextCopied] = useState(false);
  const isFormValid = () => {
    if (firstPass && secondPass) {
      setIsValid(firstPass === secondPass);
      onWalletDataChange(privateKey, firstPass, address);
    } else setIsValid(false);
  };
  const handleFirstPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFirstPass(e.currentTarget.value);
  };
  const handleSecondPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSecondPass(e.currentTarget.value);
  };

  const handleCopyAddress = () => {
    useCopyText(address);
    setIsTextCopied(true);
  };

  useEffect(() => isFormValid(), [firstPass, secondPass]);
  useEffect(() => {
    const account = LikeLib.Account.createAccount();

    setAddress(account.getAddress());
    setPrivateKey(account.getPrivKey());
    setIsTextCopied(false);
  }, []);

  return (
    <div className="CreateWallet">
      <div className="CreateWallet__TopInfoMessage">
        You are going to create a new wallet:
      </div>
      <div className="CreateWallet__Address">
        <Input
          required={true}
          className="CreateWallet__Address-Input"
          disabled={true}
          defaultValue={address}
        />
        <Button
          background={"#293249"}
          border={true}
          width={94}
          boldText={true}
          onClick={handleCopyAddress}
        >
          {isTextCopied ? (
            <>
              <FontAwesomeIcon
                className="CreateWallet__TextCopied"
                icon={faCheck}
              />
              Copied!
            </>
          ) : (
            "Copy Address"
          )}
        </Button>
      </div>
      <div className="CreateWallet__PasswordInputs">
        <Input
          label="Password"
          required={true}
          type="password"
          onChange={handleFirstPasswordChange}
        />

        <Input
          label="Repeat password"
          required={true}
          type="password"
          onChange={handleSecondPasswordChange}
        />
      </div>
      <div className="CreateWallet__BottomInfoMessage">
        It is very important you save the Keystone file to log in to the account
        next time
      </div>
    </div>
  );
};

export default CreateWallet;
