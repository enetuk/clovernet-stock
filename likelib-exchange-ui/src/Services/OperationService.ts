import { BACKEND_URL } from "../Common/constants";
import axios from "axios";
import { Service } from "typedi";

interface IConfirmDeposit {
  internalID: string;
  currency: string;
  network: string;
  amount: number;
}

interface IConfirmWithdraw {
  internalID: string;
  currency: string;
  network: string;
  amount: number;
  address: string;
}

const depositConfirmURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3000/api/operation/deposit`
    : `${BACKEND_URL}/operation/deposit`;
const withdrawConfirmURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:3000/api/operation/withdraw`
    : `${BACKEND_URL}/operation/withdraw`;

@Service()
export class OperationService {
  async confirmDeposit(params: IConfirmDeposit) {
    await axios.post(depositConfirmURL, params);
  }

  async confirmWithdraw(params: IConfirmWithdraw) {
    await axios.post(withdrawConfirmURL, params);
  }
}
