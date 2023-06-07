import { FC,ReactElement, useState } from "react";
import { Props as BrowserProps, BrowserBands } from "./BrowserBands";

export const defaultProps = ():BrowserProps[] => {
  return ([
    { path: "/icon", connection: false },
    { path: "/score", connection: false },
    { path: "/playerName", connection: false },
    { path: "/team", connection: false },
    { path: "/transition", connection: false },
  ]);
}

const updateState = (setBadges: React.Dispatch<React.SetStateAction<BrowserProps[]>>) => {
  window.app.on(
    "connections",
    (e: Electron.IpcRendererEvent, data: Record<string, boolean>) => {
      let list: BrowserProps[] = [];
      Object.keys(data).forEach((key) => {
        list.push({ connection: data[key], path: key });
      });
      setBadges(list);
    }
  );
};

export const Browser = () => {
  const [badges,setbadges] = useState(defaultProps());
  updateState(setbadges);

  return (
    <div className="m-6 max-w-sm p-6  border-gray-200 bg-white border rounded-lg shadow">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        OBS Browser Source Connection States.
      </h5>
      <p className="font-normal text-gray-700 mb-4">
        Here are the biggest enterprise technology acquisitions of 2021 so far,
        in reverse chronological order.
      </p>
        {badges.map(p => {return <BrowserBands {...p} key={p.path}/>})}
    </div>
  );
};
