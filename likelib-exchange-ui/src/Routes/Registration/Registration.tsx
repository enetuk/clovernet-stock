import React from "react";
import "./Registration.scss";
import { RegistrationForm } from "../../Components/FormLogin/FormLogin";

export const Registration: React.FC = () => {
  return (
    <div className="Login__Content">
      <RegistrationForm />
    </div>
  );
};
