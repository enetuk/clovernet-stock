import React, {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import "./Header.scss";
import likelib from "../../Assets/Icons/likelib.svg";
import { UserContext } from "../../Contexts/UserProvider";
import { getUIAddress } from "../../Utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import { useCopyText } from "../../hooks/useCopyText";
import { MarketsDropdown } from "../TokenPairsDropdown/TokenPairsDropdown";
import useResizeObserver from "use-resize-observer";

enum CopyState {
  COPY = "Copy",
  COPIED = "Copied!",
}

const Header: FC<{ onConnectWallet: Dispatch<SetStateAction<boolean>> }> = ({
  onConnectWallet,
}) => {
  const { user, signOut } = useContext(UserContext);
  const [copyState, setCopyState] = useState<CopyState>(CopyState.COPY);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  const headerRef = useRef(null);
  const [showIcon, setShowIcon] = useState(false);
  const onMouseLeave = () => {
    setCopyState(CopyState.COPY);
    setTooltipVisible(false);
  };

  const onMouseEnter = () => {
    setTooltipVisible(true);
  };

  const copyToClipBoard = async () => {
    if (user) {
      const textToCopy = getUIAddress(user.address);
      useCopyText(textToCopy).then(() => setCopyState(CopyState.COPIED));
    }
  };
  const handleOnClick = () => {
    onConnectWallet(true);
  };

  useResizeObserver<HTMLDivElement>({
    ref: headerRef,
    onResize: ({ width }) => {
      setShowIcon(Boolean(width && width < 530));
    },
  });

  // if (isLoggedIn) {
  return (
    <div className="Header" ref={headerRef}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="logo">
          <img src={likelib} alt="[ likelib-img ]" />
        </div>
        <div className="mkr-logo">
          <MarketsDropdown />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {user && (
          <>
            <p className="my-wallet-text">My Wallet</p>
            <div className="right-logo">
              <div className="active" />
              <div className="Header__wallet">
                <p>{user && user.address}</p>
                <div
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  className="Header__wallet-icon"
                >
                  <div ref={tooltipRef} className="tooltip">
                    <FontAwesomeIcon
                      onClick={() => copyToClipBoard()}
                      icon={faCopy}
                    />
                    <span
                      style={{
                        visibility: tooltipVisible ? "visible" : "hidden",
                      }}
                      className="tooltiptext"
                    >
                      {copyState}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {user ? (
        <Button
          background={"#3cb34f"}
          onClick={signOut}
          width={showIcon ? 32 : 120}
        >
          {showIcon ? <FontAwesomeIcon icon={faSignOutAlt} /> : "LOGOUT"}
        </Button>
      ) : (
        <Button
          background={"#3cb34f"}
          onClick={handleOnClick}
          width={showIcon ? 32 : 120}
        >
          {showIcon ? <FontAwesomeIcon icon={faSignInAlt} /> : "LOGIN"}
        </Button>
      )}

      {/*<button className="Header__ButtonStyled" onClick={() => signOut()}>*/}
      {/*  Logout*/}
      {/*</button>*/}
    </div>
  );
  // } else {
  //   return (
  //     <div className="Header">
  //       <div
  //         style={{
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "end",
  //           width: "100%",
  //         }}
  //       >
  //         <button
  //           className="Header__ButtonStyled"
  //           onClick={() => history.push("/registration")}
  //         >
  //           Sign Up
  //         </button>
  //         <button
  //           className="Header__ButtonStyled"
  //           onClick={() => history.push("/login")}
  //         >
  //           Sign In
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }
};
export default Header;
