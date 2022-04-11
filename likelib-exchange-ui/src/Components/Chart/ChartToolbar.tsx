import React, { useState } from "react";
import "./Chart.scss";

export interface ChartToolbarItem {
  id: string;
  name: string;
  value: string;
}

export interface ChartToolbarProps {
  onClick: (value: string) => void;
  items: ChartToolbarItem[];
  initialActiveId: string;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = (props) => {
  const [activeId, setActiveId] = useState<string>(props.initialActiveId);

  const onItemClick = (item: ChartToolbarItem) => {
    setActiveId(item.id);
    props.onClick(item.value);
  };

  return (
    <div className="chart-toolbar">
      {props.items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item)}
          className={
            activeId === item.id
              ? "chart-toolbar__button _active"
              : "chart-toolbar__button"
          }
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};
