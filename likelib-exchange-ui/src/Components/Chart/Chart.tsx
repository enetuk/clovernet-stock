import React, { FC, useContext, useEffect, useRef, useState } from "react";
import {
  BusinessDay,
  createChart,
  IChartApi,
  ISeriesApi,
  LineData,
  TickMarkType,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import "./Chart.scss";
import useResizeObserver from "use-resize-observer";
import {
  PriceAggregationItem,
  PriceAggregationPeriod,
  PriceService,
} from "../../Services/PriceService";
import { ChartToolbar } from "./ChartToolbar";
import { Container } from "typedi";
import { TokenPairContext } from "../../Contexts/TokenPairProvider";

let createdChart: IChartApi;
let areaSeries: ISeriesApi<"Area"> | undefined = undefined;

interface IChartProps {
  parentRef: React.RefObject<HTMLDivElement>;
}

const chartToolbarItems = [
  {
    id: PriceAggregationPeriod.DAY,
    value: PriceAggregationPeriod.DAY,
    name: "1D",
  },
  {
    id: PriceAggregationPeriod.HOUR,
    value: PriceAggregationPeriod.HOUR,
    name: "1H",
  },
];

const priceService = Container.get(PriceService);

const Chart: FC<IChartProps> = ({ parentRef }) => {
  const divx = useRef<HTMLDivElement>(null);
  const [currentActivePeriod, setCurrentActivePeriod] =
    useState<PriceAggregationPeriod>(PriceAggregationPeriod.DAY);
  const [chartData, setChartData] = useState<PriceAggregationItem[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const { activeTokenPair } = useContext(TokenPairContext);

  useResizeObserver<HTMLDivElement>({
    ref: parentRef,
    onResize: ({ width }) => {
      if (createdChart && width) {
        console.log(width);
        createdChart.resize(width, 450);
      }
    },
  });

  useEffect(() => {
    fetchData();
  }, [currentActivePeriod, activeTokenPair]);

  useEffect(() => {
    if (chartData.length && divx.current && createdChart) {
      areaSeries && !initialLoad && createdChart.removeSeries(areaSeries);
      areaSeries = createdChart.addAreaSeries({
        topColor: "rgba(76, 175, 80, 0.56)",
        bottomColor: "rgba(76, 175, 80, 0.04)",
        lineColor: "rgba(76, 175, 80, 1)",
        lineWidth: 2,
      });
      areaSeries.setData(
        chartData.map(
          (i) =>
            ({
              time: Date.parse(i.time) / 1000,
              value: i.value,
            } as LineData)
        )
      );
      chartData &&
        chartData.length &&
        createdChart.timeScale().setVisibleRange({
          from: (Date.parse(chartData[0].time) / 1000) as Time,
          to: (Date.parse(chartData[chartData.length - 1].time) / 1000) as Time,
        });
      setInitialLoad(false);
    }
  }, [chartData]);

  const fetchData = async () => {
    if (activeTokenPair) {
      const data = await priceService.getAggregatedPriceItems(
        currentActivePeriod,
        activeTokenPair.id
      );
      setChartData(data);
    }
  };

  const onChartItemClick = (value: string) => {
    setCurrentActivePeriod(value as PriceAggregationPeriod);
  };

  useEffect(() => {
    if (divx.current) {
      createdChart = createChart(divx.current, {
        layout: {
          backgroundColor: "#000000",
          textColor: "#d1d4dc",
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            color: "rgba(42, 46, 57, 0.5)",
          },
        },
        timeScale: {
          rightOffset: 12,
          barSpacing: 3,
          fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: false,
          borderVisible: false,
          borderColor: "#fff000",
          visible: true,
          timeVisible: true,
          tickMarkFormatter: (
            time: UTCTimestamp | BusinessDay,
            tickMarkType: TickMarkType,
            locale: string
          ) => {
            const date = new Date((time as number) * 1000);
            if (tickMarkType === TickMarkType.Time) {
              return date.toLocaleTimeString(locale);
            } else {
              return date.toLocaleDateString(locale);
            }
          },
        },
        rightPriceScale: {
          borderVisible: false,
        },
        localization: {
          locale: "en-US",
        },
        crosshair: {
          horzLine: {
            visible: false,
          },
        },
      });
    }
  }, []);

  return (
    <div className="chart-wrapper">
      <>
        <div ref={divx} id="chart" className="chart-container" />
        <ChartToolbar
          initialActiveId={currentActivePeriod}
          onClick={onChartItemClick}
          items={chartToolbarItems}
        />
      </>
      {!chartData || !chartData.length ? (
        <div className="chart-empty-container">No Chart Data</div>
      ) : null}
    </div>
  );
};
export default Chart;
