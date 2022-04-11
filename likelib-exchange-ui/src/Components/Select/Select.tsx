import React from "react";
import Select, { Props, StylesConfig } from "react-select";

export interface ISelect {
  value: string;
  label: string;
}
const colourStyles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "#1b1b1b",
    border: "2px solid #202123",
    color: "white",
    paddingLeft: "6px",
  }),
  singleValue: (styles) => ({ ...styles, color: "white" }),
};
const StyledSelect: React.FC<Props> = (props) => {
  return <Select {...props} styles={colourStyles} />;
};

export default StyledSelect;
