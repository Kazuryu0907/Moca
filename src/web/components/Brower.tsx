import { FC,ReactElement } from "react";
import { Props as BrowserProps, BrowserBands } from "./BrowserBands";

export const Browser = ({badgelist}:{badgelist:BrowserProps[]}) => {
  return (
    <div className="m-6 max-w-sm p-6  border-gray-200 bg-white border rounded-lg shadow">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        OBS Browser Source Connection States.
      </h5>
      <p className="font-normal text-gray-700 mb-4">
        Here are the biggest enterprise technology acquisitions of 2021 so far,
        in reverse chronological order.
      </p>
        {badgelist.map(p => {return <BrowserBands {...p} key={p.path}/>})}
    </div>
  );
};
