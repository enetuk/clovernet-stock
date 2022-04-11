import { FC } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import tik from "../../Assets/Icons/tik.png";
import cross from "../../Assets/Icons/cross.svg";
interface props {
  data: any;
  id?: number;
}

const NotificationRunning: FC<{ data: any }> = ({ data }) => {
  const perc = (data.per2 / 100) * 327;
  return (
    <>
      <div className="name">
        {data.name}
        <div className="details">{`${data.late} (Est. ${data.Est} seconds)`}</div>
      </div>
      <div className="progress-bar" style={{ height: 30, width: 30 }}>
        <CircularProgressbar
          value={data.per1}
          styles={buildStyles({
            strokeLinecap: "butt",

            // Text size
            pathTransitionDuration: 0,
            pathColor: `#4C8FF0`,
            textColor: "#f88",
            trailColor: "#293B54",
          })}
        />
      </div>
      <div className="loding-bar" style={{ width: perc }} />
    </>
  );
};

const NotificationSuccess: FC<{ data: any }> = ({ data }) => {
  const perc = (data.per2 / 100) * 327;
  return (
    <>
      <div className="name">
        {data.name}
        <div className="details">{`${data.ago} ago`}</div>
      </div>
      <div className="checkitem">
        <img src={tik} alt="tik" />
      </div>
    </>
  );
};
const NotificationCancel: FC<{ data: any }> = ({ data }) => {
  const perc = (data.per2 / 100) * 327;
  return (
    <>
      <div className="name">
        {data.name}
        <div className="details">{`${data.ago} ago`}</div>
      </div>
      <div className="checkitem">
        <img src={cross} alt="tik" />
      </div>
    </>
  );
};

const NotificationItem: FC<props> = ({ data, id }) => {
  return (
    <div
      style={{
        borderTop: id === 0 ? "2px solid black" : "1px solid black",
        borderLeft: "1px solid black",
        marginTop: 0,
      }}
      className="notification"
    >
      {data.condition === "running" ? (
        <NotificationRunning data={data} />
      ) : data.condition === "success" ? (
        <NotificationSuccess data={data} />
      ) : (
        <NotificationCancel data={data} />
      )}
    </div>
  );
};

export default NotificationItem;
