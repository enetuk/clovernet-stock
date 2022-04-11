import React, { useContext, useEffect, useState } from "react";
import "./TokenPairsDropdown.scss";
import bottomarrow from "../../Assets/Icons/header-bottom.svg";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";
import { TokenPair } from "../../Utils/types";

export const MagnifierIcon = () => {
  return (
    <svg
      width="14"
      height="13"
      viewBox="0 0 14 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="5"
        cy="5"
        r="4"
        stroke="#BFBFBF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12.5 11.5L8 7" stroke="#BFBFBF" strokeWidth="2" />
    </svg>
  );
};

export const MarketsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const dropdown = React.useRef(null);
  const { baseToken, quoteToken, tokenPairs, setActiveTokenPair } =
    useContext(TokenPairContext);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  const handleSearchChange = (e: any) => {
    const search = e.currentTarget.value;
    setSearch(search);
  };

  const clickOnWrapper = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getSearchField = () => {
    return (
      <div className="TokenPairsDropdown__SearchWrapper">
        <div className="TokenPairsDropdown__MagnifierIconWrapper">
          {MagnifierIcon()}
        </div>
        <input
          className="TokenPairsDropdown__SearchField"
          onChange={handleSearchChange}
          value={search}
        />
      </div>
    );
  };

  const header = (
    <div className="TokenPairsDropdown__MarketsDropdownHeader">
      <div className="mkr-logo">
        <p className="mkr-text">
          {baseToken?.symbol} / {quoteToken?.symbol}
        </p>
        <img className="bottom-arrow" src={bottomarrow} alt="bottom-arrow" />
      </div>
    </div>
  );

  const clickOnPair = (pair: TokenPair) => {
    setActiveTokenPair(pair);
    setIsOpen(false);
  };

  const getMarkets = () => {
    const filteredMarkets = tokenPairs.filter((pair) => {
      if (!search) return true;
      return (
        pair.quoteToken.symbol.toUpperCase().includes(search.toUpperCase()) ||
        pair.baseToken.symbol.toUpperCase().includes(search.toUpperCase())
      );
    });

    return (
      <table className="TokenPairsDropdown__Table">
        <tr className="TokenPairsDropdown__TR TokenPairsDropdown__TR-Head">
          <th className="TokenPairsDropdown__TH TokenPairsDropdown__THFirstStyled">
            Pair
          </th>
          {/*<th className="TokenPairsDropdown__TH TokenPairsDropdown__THLastStyled">*/}
          {/*  Price*/}
          {/*</th>*/}
        </tr>
        <tbody className="TokenPairsDropdown__TBody">
          {filteredMarkets.map((pair, index) => {
            const baseSymbol = pair.baseToken.symbol.toUpperCase();
            const quoteSymbol = pair.quoteToken.symbol.toUpperCase();

            return (
              <tr
                className="TokenPairsDropdown__TRStyled"
                key={index}
                onClick={() => clickOnPair(pair)}
              >
                <td className="_option" style={{ textAlign: "center" }}>
                  {baseSymbol} / {quoteSymbol}
                </td>
                {/*<td*/}
                {/*  className="_option"*/}
                {/*  style={{*/}
                {/*    textAlign: "center",*/}
                {/*  }}*/}
                {/*>*/}
                {/*  100*/}
                {/*</td>*/}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const body = (
    <div className="TokenPairsDropdown__MarketsDropdownBody">
      <div ref={dropdown} className="TokenPairsDropdown__MarketsFilters">
        {getSearchField()}
      </div>
      <div className="TokenPairsDropdown__TableWrapper">{getMarkets()}</div>
    </div>
  );

  return (
    <div onClick={clickOnWrapper} className="Dropdown__Wrapper">
      <div className="Dropdown__Header" onClick={() => setIsOpen(!isOpen)}>
        {header}
      </div>
      {isOpen ? <div className="Dropdown__Body-Wrapper">{body}</div> : null}
    </div>
  );
};
