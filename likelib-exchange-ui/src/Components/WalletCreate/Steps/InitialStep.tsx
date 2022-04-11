import React from "react";
import Button from "../../Button/Button";
import "./styles.scss";
interface IInitialStep {
  onCreateNewWallet(): void;
  onImportKeyStore(): void;
}
const InitialStep: React.FC<IInitialStep> = ({
  onCreateNewWallet,
  onImportKeyStore,
}) => {
  return (
    <div className="body-wrap">
      <Button background={"#293249"} border={true} onClick={onCreateNewWallet}>
        Create new
      </Button>
      <div className="divider">OR</div>
      <Button
        background={"#293249"}
        border={true}
        boldText={true}
        onClick={onImportKeyStore}
      >
        Import keystore file
      </Button>
    </div>
  );
};

export default InitialStep;
