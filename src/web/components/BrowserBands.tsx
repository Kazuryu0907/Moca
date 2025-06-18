import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type Props = {
  connection: boolean;
  path: string;
};

const crossSVG = (className: string) => {
  return <XMarkIcon className={className} />;
};

const checkSVG = (className: string) => {
  return <CheckIcon className={className} />;
};

export const BrowserBands = (props: Props) => {
  const green = "bg-green-100 text-green-800 border-green-400";
  const red = "bg-red-100 text-red-800 border-red-400";
  const colorClass = props.connection ? green : red;

  const svgClassName = "ml-1 h-4 w-4";
  return (
    <span
      className={`${colorClass} mt-2 text-sm font-medium mr-2 px-2.5 py-0.5 rounded border inline-flex items-center`}
    >
      {props.path}
      {props.connection ? checkSVG(svgClassName) : crossSVG(svgClassName)}
    </span>
  );
};
