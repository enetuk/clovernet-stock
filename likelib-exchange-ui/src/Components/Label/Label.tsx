import React from "react";
import "./Label.scss";

interface ILabel {
  color: string;
  onClick?(): void;
}
const Label: React.FC<ILabel> = ({ color, children, onClick }) => {
  return (
    <span
      className="Label"
      style={{
        backgroundColor: color,
        border: `${color ? "none" : "1px"} solid white`,
      }}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

export default Label;
