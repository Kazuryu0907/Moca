import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect } from "react";
import { FC, memo, ReactElement, useMemo, useState } from "react";
import { Browsers } from "../../common/types";
import { BrowserBands, Props as BrowserProps } from "./BrowserBands";

export const defaultProps = (): BrowserProps[] => {
  return Browsers.map(p => {
    return { path: p, connection: false };
  });
};

const updateState = (setBadges: React.Dispatch<React.SetStateAction<BrowserProps[]>>) => {
  window.app.on(
    "connections",
    (e: Electron.IpcRendererEvent, data: Record<string, boolean>) => {
      const list: BrowserProps[] = [];
      Object.keys(data).forEach((key) => {
        list.push({ connection: data[key], path: key });
      });
      setBadges(list);
    },
  );
};

export const Browser = () => {
  const [badges, setbadges] = useState(defaultProps());
  const [ip_address, setIp_address] = useState("");
  useEffect(() => {
    const getIp = async () => {
      const ip_address = await window.app.getHostIp();
      setIp_address(ip_address);
    };
    getIp();
  }, []);
  updateState(setbadges);
  window.app.connectedBrowsers().then(c => {
    const list: BrowserProps[] = [];
    Object.keys(c).forEach(key => {
      list.push({ connection: c[key], path: key });
    });
  });

  return (
    <div className="m-6 max-w-sm p-6  border-gray-200 bg-white border rounded-lg shadow">
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
        OBS Browser Source Connection States.
      </h5>
      <p className="font-normal text-gray-700 mb-4">
        OBS is good software.
      </p>
      {badges.map(p => {
        return <BrowserBands {...p} key={p.path} />;
      })}

      <p>Controller is Here</p>
      <a className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
        {`http://${ip_address}:5173/controller`}
      </a>
      <QRCodeCanvas value={`http://${ip_address}:5173/controller`} size={128} />
    </div>
  );
};
