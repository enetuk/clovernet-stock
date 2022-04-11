import React from "react";
import Modal from "react-modal";
import "./Modal.scss";

interface IStyledModal {
  isOpen: boolean;
  width?: React.CSSProperties;
  showCloseBtn?: boolean;
  onClose?(): void;
}
Modal.setAppElement("#root");

const StyledModal: React.FC<IStyledModal> = ({
  isOpen,
  onClose,
  showCloseBtn = true,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={"content"}
      overlayClassName="modalOverlay"
    >
      <div className={"body"}>
        {showCloseBtn && <div className={"closeBtn"} onClick={onClose} />}
        {children}
      </div>
    </Modal>
  );
};

export default StyledModal;
