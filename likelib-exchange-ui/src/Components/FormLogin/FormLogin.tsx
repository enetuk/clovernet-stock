import React, { useContext, useState } from "react";
import "./FormLogin.scss";
import { useHistory } from "react-router";
import { Container } from "typedi";
import { UserService } from "../../Services/UserService";
import { UserContext } from "../../Contexts/UserProvider";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DispatchProps {}

type LoginFormProps = DispatchProps;
const usersService = Container.get(UserService);

export const LoginForm: React.FC<LoginFormProps> = (props) => {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { signIn } = useContext(UserContext);

  const onFormSubmit = async () => {
    if (login && password) {
      await signIn(login, password);
    }
  };

  const onChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="FormLogin__Content">
      <h1 className="FormLogin__Title">Sign in</h1>
      <div className="FormLogin__FieldsContainer">
        <label className="FormLogin__Label">Login:</label>
        <input
          className="FormLogin__InputField"
          value={login}
          onChange={onChangeLogin}
        />
      </div>
      <div className="FormLogin__FieldsContainer">
        <label className="FormLogin__Label">Password:</label>
        <input
          className="FormLogin__InputField"
          type={"password"}
          value={password}
          onChange={onChangePassword}
        />
      </div>
      <button
        className="FormLogin__ButtonStyled"
        onClick={() => onFormSubmit()}
      >
        Submit
      </button>
    </div>
  );
};

export const RegistrationForm: React.FC<LoginFormProps> = (props) => {
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const history = useHistory();

  const onFormSubmit = async () => {
    if (login && password) {
      await usersService.registration(login, password);
      history.push("/login");
      // TODO add notification
    }
  };

  const onChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };

  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className="FormLogin__Content">
      <h1 className="FormLogin__Title">Sign up</h1>
      <div className="FormLogin__FieldsContainer">
        <label className="FormLogin__Label">Login:</label>
        <input
          className="FormLogin__InputField"
          value={login}
          onChange={onChangeLogin}
        />
      </div>
      <div className="FormLogin__FieldsContainer">
        <label className="FormLogin__Label">Password:</label>
        <input
          className="FormLogin__InputField"
          type={"password"}
          value={password}
          onChange={onChangePassword}
        />
      </div>
      <button
        className="FormLogin__ButtonStyled"
        disabled={!login || !password}
        onClick={() => onFormSubmit()}
      >
        Submit
      </button>
    </div>
  );
};
