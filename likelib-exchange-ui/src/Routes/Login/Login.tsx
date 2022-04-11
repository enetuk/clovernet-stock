import React from "react";
import "./Login.scss";
import { LoginForm } from "../../Components/FormLogin/FormLogin";

export const Login: React.FC = () => {
  return (
    <div className="Login__Content">
      <LoginForm />
    </div>
  );
};
