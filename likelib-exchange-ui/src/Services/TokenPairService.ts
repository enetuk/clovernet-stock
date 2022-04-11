import { Service } from "typedi";
import axios, { AxiosResponse } from "axios";
import { BACKEND_URL } from "../Common/constants";
import { TokenPair } from "../Utils/types";

const TOKENS_URL = `${BACKEND_URL}/tokens`;

@Service()
export class TokenPairService {
  public async loadTokenPairs(): Promise<TokenPair[]> {
    const data = await axios.get<any, AxiosResponse<TokenPair[]>>(
      `${TOKENS_URL}/token-pairs`
    );

    return data.data;
  }
}
