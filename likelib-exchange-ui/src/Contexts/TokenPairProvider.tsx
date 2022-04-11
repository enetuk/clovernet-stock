import React, { useEffect, useState } from "react";
import { Container } from "typedi";
import { TokenPairService } from "../Services/TokenPairService";
import { TokenPair, Token } from "../Utils/types";

interface TokenPairContextProps {
  tokenPairs: TokenPair[];
  activeTokenPair: TokenPair | undefined;
  setActiveTokenPair(activePair: TokenPair): void;
  baseToken: Token;
  quoteToken: Token;
}

export const TokenPairContext = React.createContext<TokenPairContextProps>(
  undefined as any
);

const tokenPairService = Container.get(TokenPairService);

export const TokenPairProvider: React.FC = ({ children }) => {
  const [tokenPairs, setTokenPairs] = useState<TokenPair[]>([]);
  const [activeTokenPair, setActiveTokenPair] = useState<
    TokenPair | undefined
  >();
  const [baseToken, setBaseToken] = useState<Token>();
  const [quoteToken, setQuoteToken] = useState<Token>();

  useEffect(() => {
    if (activeTokenPair) {
      setBaseToken(activeTokenPair.baseToken);
      setQuoteToken(activeTokenPair.quoteToken);
    }
  }, [activeTokenPair]);

  useEffect(() => {
    tokenPairService.loadTokenPairs().then((tokens) => {
      setTokenPairs(tokens);
      setActiveTokenPair(tokens[0]);
    });
  }, []);

  return (
    <TokenPairContext.Provider
      value={{
        tokenPairs,
        activeTokenPair,
        setActiveTokenPair,
        baseToken: baseToken!,
        quoteToken: quoteToken!,
      }}
    >
      {children}
    </TokenPairContext.Provider>
  );
};
