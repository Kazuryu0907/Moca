import React, { useEffect } from "react";
import { FC,ReactElement, useMemo, useState,memo } from "react";
import { Props as BrowserProps, BrowserBands } from "./BrowserBands";
import {Browsers} from "../../common/types";
import {QRCodeCanvas} from "qrcode.react";




export const ControllerAccess = () => {
    const [ip_address,setIp_address] = useState("");
    useEffect(() => {
      const getIp = async () => {
        const ip_address = await window.app.getHostIp();
        setIp_address(ip_address);
      };;
      getIp();
    },[]);
    const url = `http://${ip_address}:5173/controller`;
  
    return (
      <div className="m-6 max-w-sm p-6  border-gray-200 bg-white border rounded-lg shadow">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            Remote Controller
        </h5>
        <p className="font-normal text-gray-700 mb-4">
          スマホやタブレットからアクセスしてね
        </p>

        <p>Controller is Here</p>
        <a href="#" onClick={async() => await window.app.openBrowser(url)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{url}</a>
        <div className="mt-2">
            <QRCodeCanvas value={url}
              size={128}
            />
        </div>
      </div>
    );

};