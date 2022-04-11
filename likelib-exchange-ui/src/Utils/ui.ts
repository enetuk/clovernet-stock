import { OrderStatus } from "./types";

export const ORDER_STATUSES = {
  [OrderStatus.Added]: {
    text: "Pending",
    color: "rgb(255, 101, 52)",
  },
  [OrderStatus.Filled]: {
    text: "Pending",
    color: "rgb(255, 101, 52)",
  },
  [OrderStatus.Cancelled]: {
    text: "Cancelled",
    color: "red",
  },
  [OrderStatus.Expired]: {
    text: "Cancelled",
    color: "orange",
  },
  [OrderStatus.FullyFilled]: {
    text: "Filled",
    color: "rgb(60, 179, 79)",
  },
};
