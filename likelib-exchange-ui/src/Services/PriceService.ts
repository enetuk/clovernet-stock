import { Service } from "typedi";
import axios, { AxiosResponse } from "axios";
import { BACKEND_URL } from "../Common/constants";

const PRICE_URL = `${BACKEND_URL}/price`;

export enum PriceAggregationPeriod {
  HOUR = "hour",
  DAY = "day",
}

export interface PriceAggregationItem {
  time: string;
  value: number;
}

@Service()
export class PriceService {
  public async getAggregatedPriceItems(
    period: PriceAggregationPeriod,
    tokenPair: string
  ): Promise<PriceAggregationItem[]> {
    const data = await axios.get<any, AxiosResponse<PriceAggregationItem[]>>(
      `${PRICE_URL}/aggregation`,
      { params: { period, tokenPair } }
    );

    return data.data;
  }
}
