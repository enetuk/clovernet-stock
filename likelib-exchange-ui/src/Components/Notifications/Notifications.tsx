import { FC, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import NotificationItem from "./NotificationItem";
import "./Notifications.scss";
const Notifications: FC = () => {
  const [percentage, setpercentage] = useState<number>(50);
  const notifications = [
    {
      name: "Limit Buy 200.5 ZRX",
      condition: "running",
      ago: false,
      late: "00.15",
      Est: "45 sec",
      per1: 50,
      per2: 70,
    },
    {
      name: "Market Sell 12 ETH",
      condition: "success",
      ago: "4 minutes",
      late: "00.15",
      Est: "45 sec",
    },
    {
      name: "Market Sell 12 ETH",
      condition: "success",
      ago: "4 minute",
      late: "00.15",
      Est: "45 sec",
    },
    {
      name: "Cancelled Order 15.33 REP",
      condition: "cancelled",
      ago: "9 days ago",
      late: "00.15",
      Est: "45 sec",
    },
    {
      name: "Cancelled Order 15.33 REP",
      condition: "cancelled",
      ago: "9 days ago",
      late: "00.15",
      Est: "45 sec",
    },
  ];
  return (
    <div className="Notifications">
      <div className="boxer" />
      <h1
        style={{
          background: "#202123",
          borderTopLeftRadius: "2px",
          borderTopRightRadius: "2px",
          marginLeft: "1px",
        }}
        className="div-header notifications-header"
      >
        Notifications
      </h1>

      {notifications.map((item, key) => (
        <NotificationItem id={key} data={item} key={key} />
      ))}
    </div>
  );
};

export default Notifications;
