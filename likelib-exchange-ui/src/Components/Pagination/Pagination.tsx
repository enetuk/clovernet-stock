import { FC, ReactElement, useEffect, useState } from "react";
import "./Pagination.scss";

interface props {
  active: number;
  total: number;
  perpage: number;
  style: React.CSSProperties;
  setactive: any;
}

const Pagination: FC<props> = ({
  active,
  total,
  perpage,
  style,
  setactive,
}) => {
  const totalPage: number = Math.ceil(total / perpage);
  const [paginationNumbers, setpaginationsNumbers] = useState<ReactElement[]>();

  const calculateFirstPaginationPart = (
    totalPage: number,
    activePage: number
  ): ReactElement[] => {
    const elements = [];
    // always render first part
    elements.push(
      <Button
        setactive={setactive}
        isActive={activePage === 1}
        page={1}
        key={1}
      />
    );
    if (activePage - 1 > 2) {
      elements.push(<PaginationDot key="begin-pagination-dots" />);
    }

    return elements;
  };

  const calculateCentralPaginationPart = (
    totalPage: number,
    activePage: number
  ) => {
    const elements = [];

    if (activePage - 1 >= 2) {
      if (totalPage - activePage >= 2) {
        elements.push(
          <Button
            setactive={setactive}
            isActive={false}
            page={activePage - 1}
            key={activePage - 1}
          />
        );
        elements.push(
          <Button
            setactive={setactive}
            isActive={true}
            page={activePage}
            key={activePage}
          />
        );
        elements.push(
          <Button
            setactive={setactive}
            isActive={false}
            page={activePage + 1}
            key={activePage + 1}
          />
        );
      } else {
        elements.push(
          <Button
            setactive={setactive}
            isActive={totalPage - 3 === activePage}
            page={totalPage - 3}
            key={totalPage - 3}
          />,
          <Button
            setactive={setactive}
            isActive={totalPage - 2 === activePage}
            page={totalPage - 2}
            key={totalPage - 2}
          />,
          <Button
            setactive={setactive}
            isActive={totalPage - 1 === activePage}
            page={totalPage - 1}
            key={totalPage - 1}
          />
        );
      }
    } else if (totalPage) {
      elements.push(
        <Button
          setactive={setactive}
          isActive={2 === activePage}
          page={2}
          key={2}
        />,
        <Button
          setactive={setactive}
          isActive={3 === activePage}
          page={3}
          key={3}
        />,
        <Button
          setactive={setactive}
          isActive={4 === activePage}
          page={4}
          key={4}
        />
      );
    }

    return elements;
  };

  const calculateEndPaginationPart = (
    totalPage: number,
    activePage: number
  ) => {
    const elements = [];

    if (totalPage - activePage > 2) {
      elements.push(<PaginationDot key="end-pagination-dots" />);
    }

    elements.push(
      <Button
        setactive={setactive}
        isActive={totalPage === activePage}
        page={totalPage}
        key={totalPage}
      />
    );

    return elements;
  };

  useEffect(() => {
    let temp: ReactElement[] = [];

    // if total page < 6 than render all pages
    if (totalPage < 6) {
      for (let i = 1; i <= totalPage; i++) {
        temp.push(
          <Button
            setactive={setactive}
            page={i}
            isActive={active === i}
            key={i}
          />
        );
      }
    } else {
      temp = [
        ...calculateFirstPaginationPart(totalPage, active),
        ...calculateCentralPaginationPart(totalPage, active),
        ...calculateEndPaginationPart(totalPage, active),
      ];
    }
    setpaginationsNumbers([...temp]);
  }, [active, total]);

  return (
    <div style={{ ...style }} className="Pagination">
      <button
        disabled={active === 1}
        onClick={() => setactive(active - 1)}
        className="button leftbutton"
      >
        Prev
      </button>
      {paginationNumbers}
      <button
        disabled={active === totalPage}
        onClick={() => setactive(active + 1)}
        className="button rightbutton"
      >
        Next
      </button>
    </div>
  );
};

const PaginationDot: FC<{ key?: string | number }> = () => {
  return (
    <div className="dot">
      <div />
      <div />
    </div>
  );
};

const Button: FC<{
  page: number;
  isActive: boolean;
  setactive: (page: number) => void;
}> = ({ setactive, page, isActive }) => {
  return (
    <button
      style={{ background: isActive ? "rgb(60, 179, 79)" : "" }}
      onClick={() => setactive(page)}
    >
      {page}
    </button>
  );
};

export default Pagination;
