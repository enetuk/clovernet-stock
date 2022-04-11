import clsx from "clsx";
import React from "react";
import "./Button.scss";

interface IButton {
  onClick?(): void;
  background?: "#3cb34f" | "#293249" | "none";
  border?: boolean;
  boldText?: boolean;
  disabled?: boolean;
  width?: number;
}
const Button: React.FC<IButton> = ({
  width = 260,
  boldText = false,
  background,
  border,
  disabled,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      style={{ width, background }}
      className={clsx("btn", {
        ["border"]: border,
        ["without-background"]: background === "none",
        ["boldText"]: boldText,
        ["disabled"]: disabled,
      })}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
