import { Service } from "typedi";
import { CurrentUser, UserBalance } from "../Contexts/UserProvider";
import axios, { AxiosResponse } from "axios";
import { BACKEND_URL } from "../Common/constants";

const USERS_URL = `${BACKEND_URL}/users`;

interface LoginPayload {
  login: string;
  password: string;
}

type RegistrationPayload = LoginPayload;

@Service()
export class UserService {
  public async login(login: string, password: string): Promise<CurrentUser> {
    const user = await axios.post<LoginPayload, AxiosResponse<CurrentUser>>(
      `${USERS_URL}/login`,
      { login, password }
    );
    if (user.status !== 200) {
      throw new Error("Wrong credentials try again");
    }
    return user.data;
  }

  public async registration(
    login: string,
    password: string
  ): Promise<CurrentUser> {
    const user = await axios.post<
      RegistrationPayload,
      AxiosResponse<CurrentUser>
    >(`${USERS_URL}/registration`, { login, password });
    if (user.status !== 200) {
      throw new Error("Wrong credentials try again");
    }
    return user.data;
  }

  public async balance(address: string): Promise<UserBalance[]> {
    const { data } = await axios.get<
      { login: string },
      AxiosResponse<UserBalance[]>
    >(`${USERS_URL}/balance`, { params: { address } });
    return data;
  }

  public async updateOrCreateUser(address: string): Promise<CurrentUser> {
    const { data } = await axios.post<
      { address: string },
      AxiosResponse<CurrentUser>
    >(`${USERS_URL}/update`, { address });
    return data;
  }
}
