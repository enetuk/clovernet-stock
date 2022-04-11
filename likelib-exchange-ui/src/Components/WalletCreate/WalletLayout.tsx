import React, { useState } from "react";
import Button from "../Button/Button";
import StyledModal from "../Modal/Modal";
import CreateWallet from "./Steps/CreateWallet";
import ImportKeyStore from "./Steps/ImportKeyStore";
import InitialStep from "./Steps/InitialStep";
import "./WalletLayout.scss";
import { createStore, KeysData } from "key-store";
import { useSaveToFile } from "../../hooks/useSaveToFile";
interface IWallet {
  privateKey: string;
  password: string;
  address: string;
}
const WalletLayout: React.FC<{ open: boolean; onClose?(): void }> = ({
  open,
  onClose,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isImportKeyStore, setIsImportKeyStore] = useState(false);
  const [isCreateWallet, setCreateWallet] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [newWalletData, setNewWalletData] = useState<IWallet | null>(null);
  const saveToFile = (data: KeysData<string>) => {
    if (newWalletData) {
      useSaveToFile(newWalletData?.address, data);
      //TODO: Save private key in local storage
      //TODO: Change user address
    }
  };
  const store = createStore(saveToFile);
  const setStepCreateNew = () => {
    setCreateWallet(true);
    setIsSubmit(true);
  };
  const setStepImportKey = () => {
    setCreateWallet(false);
    setIsSubmit(false);
    setIsImportKeyStore(true);
  };

  const resetModal = () => {
    setCreateWallet(false);
    setIsImportKeyStore(false);
    setIsSubmit(false);
  };

  const handleClose = () => {
    resetModal();
    onClose && onClose();
  };

  const handleWalletDataChange = (
    privateKey: string,
    password: string,
    address: string
  ) => {
    setNewWalletData({ password, privateKey, address });
  };

  const handleCreateWallet = async () => {
    if (newWalletData) {
      await store.saveKey(newWalletData.address, newWalletData.password, {
        privateKey: newWalletData.privateKey,
      });
      setStepImportKey();
    }
  };

  return (
    <StyledModal isOpen={open} onClose={handleClose} showCloseBtn={false}>
      <div className={"title"}>Connect wallet</div>
      <div className={"modal-content"}>
        {isImportKeyStore && <ImportKeyStore onComplete={handleClose} />}
        {isCreateWallet && (
          <CreateWallet
            setIsValid={setIsValid}
            onWalletDataChange={handleWalletDataChange}
          />
        )}
        {!isImportKeyStore && !isCreateWallet && (
          <InitialStep
            onCreateNewWallet={setStepCreateNew}
            onImportKeyStore={setStepImportKey}
          />
        )}
      </div>
      <div className={"controls"}>
        {isSubmit && (
          <Button
            background={"#3cb34f"}
            onClick={handleCreateWallet}
            disabled={!isValid}
          >
            Create Wallet
          </Button>
        )}
        {/* <Button background={"none"} onClick={handleClose}>
          Cancel
        </Button> */}
      </div>
    </StyledModal>
  );
};

export default WalletLayout;
