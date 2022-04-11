import "reflect-metadata";
import { FC, useState } from "react";
import Home from "./Routes/Home/Home";
import "./App.scss";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { UserProvider } from "./Contexts/UserProvider";
import Header from "./Components/Header/Header";
import { OrdersProvider } from "./Contexts/OrdersProvider";
import { TokenPairProvider } from "./Contexts/TokenPairProvider";

const App: FC = () => {
  const [walletCreateOpen, setWalletCreateOpen] = useState(false);
  return (
    <div className="App">
      <Router>
        <TokenPairProvider>
          <UserProvider>
            <>
              <Header onConnectWallet={setWalletCreateOpen} />
              <OrdersProvider>
                <Switch>
                  <Route path="/home" exact>
                    <Home
                      walletCreateOpen={walletCreateOpen}
                      onClose={() => setWalletCreateOpen(false)}
                    />
                  </Route>
                  <Route path="">
                    <Redirect to="/home" />
                  </Route>
                </Switch>
              </OrdersProvider>
            </>
          </UserProvider>
        </TokenPairProvider>
      </Router>
    </div>
  );
};

export default App;
