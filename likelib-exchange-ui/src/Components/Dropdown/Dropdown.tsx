import React, { HTMLAttributes, useEffect, useRef, useState } from "react";
import "./Dropdown.scss";

export enum DropdownPositions {
  Center,
  Left,
  Right,
}

interface DropdownWrapperBodyProps {
  horizontalPosition?: DropdownPositions;
}

interface Props
  extends HTMLAttributes<HTMLDivElement>,
    DropdownWrapperBodyProps {
  isOpened?: boolean;
  body: React.ReactNode;
  header: React.ReactNode;
  shouldCloseDropdownOnClickOutside?: boolean;
}

export const Dropdown: React.FC<Props> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpened || false);
  const wrapperRef = useRef(null);
  const {
    header,
    body,
    horizontalPosition = DropdownPositions.Left,
    ...restProps
  } = props;

  const handleClickOutside = (event: any) => {
    if (wrapperRef) {
      if (event.target.classList.contains("_option")) {
        // Todo, please, remove it!!!
        setTimeout(() => {
          setIsOpen(false);
        }, 150);
      } else if (
        !(wrapperRef?.current as any)?.contains(event.target) &&
        props.shouldCloseDropdownOnClickOutside
      ) {
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="Dropdown__Wrapper" ref={wrapperRef} {...restProps}>
      <div className="Dropdown__Header" onClick={() => setIsOpen(!isOpen)}>
        {header}
      </div>
      {isOpen ? <div className="Dropdown__Body-Wrapper">{body}</div> : null}
    </div>
  );
};
