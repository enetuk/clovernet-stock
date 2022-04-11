import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useState } from "react";
import "./Input.scss";

interface IInput {
  onChange?(e: React.FormEvent): void;
  onClick?(): void;
  label?: string;
  type?: "text" | "password" | "file";
  width?: number;
  disabled?: boolean;
  defaultValue?: string;
  value?: string;
  required?: boolean;
  onlyNumbers?: boolean;
  className?: string;
  placeholder?: string;
}
const Input: React.FC<IInput> = ({
  onChange,
  onClick,
  type = "text",
  onlyNumbers,
  className,
  label,
  required = false,
  disabled,
  defaultValue,
  value,
  placeholder = "",
}) => {
  const [showPassword, setShowPassword] = useState(type);
  return (
    <div className={"Input"}>
      {label && <label className="Input__Label">{label}</label>}
      <input
        required={required}
        type={showPassword || type}
        value={defaultValue || value}
        defaultValue={defaultValue}
        className={clsx("Input__InputField", className, {
          ["Input__NoLabel"]: !label,
          ["Input__Disabled"]: disabled,
        })}
        disabled={disabled}
        onClick={() => onClick && onClick()}
        onChange={
          onlyNumbers
            ? (e) => Number(e.target.value) >= 0 && onChange && onChange(e)
            : onChange
        }
        placeholder={placeholder}
      />
      {type === "password" && (
        <FontAwesomeIcon
          onMouseDown={() => {
            setShowPassword("text");
          }}
          onMouseUp={() => {
            setShowPassword("password");
          }}
          className={clsx("Input__Eye", {
            ["Input__Eye-active"]: "text" === showPassword,
          })}
          icon={faEye}
        />
      )}
    </div>
  );
};

export default Input;
