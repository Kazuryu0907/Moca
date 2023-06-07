import { FC } from "react";

export type Props = {
  connection: boolean;
  path: string;
};

const crossSVG = () => {
  return (
    <svg
      area-hidden="true"
      className="ml-1 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};

const checkSVG = () => {
    return(
  <svg
    className="ml-1 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
    );
};

export const BrowserBands: FC<Props> = (props) => {
    const color = props.connection ? "green" : "red"; 

  return (
    <span className={`mt-2 bg-${color}-100 text-${color}-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded border border-${color}-400 inline-flex items-center`}>
      {props.path}
      {props.connection ? checkSVG() : crossSVG()}
    </span>
  );
};
