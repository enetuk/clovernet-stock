import React, { useContext, useEffect, useState } from "react";
import { Container } from "typedi";
import { LocalStorageService } from "../Services/LocalStorageService";
import { UserService } from "../Services/UserService";
import { useHistory } from "react-router";
import { BigNumber } from "@0x/utils";
import { useInterval } from "../hooks";
import { TokenPairContext } from "./TokenPairProvider";
import { UI_DECIMALS_DISPLAYED_PRICE_ETH } from "../Utils/constants";
const USER_BALANCE_POLLING_TIMEOUT = 2000;

export interface CurrentUser {
  login: string;
  address: string;
  token?: string;
}

export interface UserBalance {
  id: string;
  token: string;
  tokenBalance: string;
  userId: string;
}

type UserContextProps = {
  user?: CurrentUser;
  signIn: (login: string, password: string) => void;
  setUser: (user: CurrentUser) => void;
  signOut: () => void;
  userBaseTokenBalance: string;
  userQuoteTokenBalance: string;
  isLoggedIn: boolean;
};
const formatBalance = (tokenBalance: string) =>
  new BigNumber(tokenBalance).dividedBy(new BigNumber(10).pow(18)).toString();

export const UserContext = React.createContext<UserContextProps>({
  user: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  signIn: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  signOut: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUser: () => {},
  isLoggedIn: false,
  userBaseTokenBalance: "",
  userQuoteTokenBalance: "",
});

const localStorageService = Container.get(LocalStorageService);
const userService = Container.get(UserService);

export const UserProvider: React.FC = ({ children }) => {
  const currentUser = localStorageService.getCurrentUser();
  const [user, setUser] = useState<CurrentUser>(currentUser);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!currentUser);
  const [userBaseTokenBalance, setUserBaseTokenBalance] = useState<string>("");
  const [userQuoteTokenBalance, setUserQuoteTokenBalance] =
    useState<string>("");
  const history = useHistory();
  const { baseToken, quoteToken } = useContext(TokenPairContext);
  const [balances, setBalances] = useState<UserBalance[]>([]);

  useEffect(() => {
    if (baseToken && user) {
      const foundBalance = balances.find((b) => b.token === baseToken.address);
      foundBalance &&
        setUserBaseTokenBalance(
          parseFloat(formatBalance(foundBalance.tokenBalance)).toFixed(
            UI_DECIMALS_DISPLAYED_PRICE_ETH
          )
        );
    } else {
      setUserBaseTokenBalance("0");
    }
  }, [baseToken, user, balances]);

  useEffect(() => {
    if (quoteToken && user) {
      const foundBalance = balances.find((b) => b.token === quoteToken.address);
      foundBalance &&
        setUserQuoteTokenBalance(
          parseFloat(formatBalance(foundBalance.tokenBalance)).toFixed(
            UI_DECIMALS_DISPLAYED_PRICE_ETH
          )
        );
    } else {
      setUserQuoteTokenBalance("0");
    }
  }, [quoteToken, user, balances]);

  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshBalance(user.address);
    }
  }, []);

  useInterval(() => {
    if (user) {
      refreshBalance(user.address);
    }
  }, USER_BALANCE_POLLING_TIMEOUT);

  const signOut = () => {
    localStorageService.userLogout();
    setUser(localStorageService.getCurrentUser());
    setBalances([]);
  };

  const signIn = async (login: string, password: string) => {
    try {
      const user = await userService.login(login, password);
      localStorageService.setCurrentUser(user);
      setUser(user);
      setIsLoggedIn(true);
      history.push("/home");
    } catch (e) {
      console.error(e);
    }
  };

  const refreshBalance = (address: string) => {
    userService.balance(address).then((balances) => {
      setBalances(balances);
    });
  };

  const _setUser = (user: CurrentUser) => {
    localStorageService.setCurrentUser(user);
    setUser(user);
    setIsLoggedIn(true);
  };

  return (
    <UserContext.Provider
      value={{
        setUser: _setUser,
        user,
        signOut,
        signIn,
        isLoggedIn,
        userBaseTokenBalance,
        userQuoteTokenBalance,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
