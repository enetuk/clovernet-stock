import React, { useContext, useState } from "react";
import FileUpload from "../../FileUpload/FileUpload";
import Input from "../../Input/Input";
import { createStore, KeysData } from "key-store";

import "./ImportKeyStore.scss";
import Button from "../../Button/Button";
import { Container } from "typedi";
import { UserService } from "../../../Services/UserService";
import { UserContext } from "../../../Contexts/UserProvider";

const usersService = Container.get(UserService);
interface ImportKeyStoreProps {
  onComplete: () => void;
}

const ImportKeyStore: React.FC<ImportKeyStoreProps> = ({ onComplete }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [keyStorePassword, setKeyStorePassword] = useState("");
  const [isDecryptError, setDecryptError] = useState(false);
  const [isDecryptSuccess, setDecryptSuccess] = useState(false);
  const { setUser } = useContext(UserContext);

  const readFromFile = (
    fileToReadDataFrom: File | null
  ): Promise<KeysData<string> | undefined> => {
    if (!fileToReadDataFrom) return Promise.reject();
    return new Promise((res, rej) => {
      const fileReader = new FileReader();
      fileReader.readAsText(fileToReadDataFrom);
      fileReader.onload = () => {
        res(JSON.parse(fileReader.result as string) as KeysData<string>);
      };
      fileReader.onerror = (err) => rej(err);
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyStorePassword(e.target.value);
    setDecryptError(false);
    setDecryptSuccess(false);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    readFromFile(file).then((fileData) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const store = createStore(() => {}, fileData);
      if (store && file) {
        try {
          const { privateKey } = store.getPrivateKeyData(
            file.name,
            keyStorePassword
          ) as { privateKey: string };
          setDecryptSuccess(true);
          //TODO: Save private key in local storage
          //TODO: Change user
        } catch (error) {
          setDecryptError(true);
        }
      }
    });
  };

  const updateUser = async () => {
    if (uploadedFile) {
      const address = uploadedFile?.name;
      const user = await usersService.updateOrCreateUser(address);
      setUser(user);
      onComplete();
    }
  };

  return (
    <div className={"ImportKeyStore"}>
      {/* <div className={"closeBtn"} /> // Will no be used at the moment*/}
      <div className={"ImportKeyStore__Title"}>Import keystore file</div>
      <FileUpload
        fileName={uploadedFile?.name}
        label="Keystore File"
        onUpload={handleFileUpload}
      />
      <Input label="Password" type="password" onChange={handlePasswordChange} />
      {isDecryptError && (
        <div className="ImportKeyStore__Error">
          Wrong password or invalid keystore
        </div>
      )}
      {isDecryptSuccess && (
        <div className="ImportKeyStore__Success">
          Key has been successfully imported
        </div>
      )}
      <Button
        background={"#293249"}
        border={true}
        boldText={true}
        onClick={() => {
          updateUser();
        }}
        disabled={false}
      >
        Import keystore file
      </Button>
    </div>
  );
};

export default ImportKeyStore;
