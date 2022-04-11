import React, { useRef } from "react";
import Button from "../Button/Button";
import "./FileUpload.scss";
import Input from "../Input/Input";
interface IFileUpload {
  accept?: string;
  label?: string;
  fileName?: string;
  disabled?: boolean;
  onUpload(file: File): void;
}
const FileUpload: React.FC<IFileUpload> = ({
  accept,
  fileName,
  label,
  disabled,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files) {
      onUpload && onUpload(e.target.files[0]);
    }
  };
  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  return (
    <div>
      <div style={{ position: "relative" }}>
        <Input
          label={label}
          disabled={true}
          type="text"
          defaultValue={fileName}
        />
        <div
          onClick={handleButtonClick}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            cursor: "pointer",
          }}
        />
      </div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileUpload}
        onClick={(event) => {
          event.currentTarget.value = ""; //HACK: enable upload same file twice
        }}
        className="FileUpload__Input"
        accept={accept}
      />
    </div>
  );
};
export default FileUpload;
