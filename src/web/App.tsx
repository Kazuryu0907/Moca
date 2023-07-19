import { useState } from "react";
import { Browser } from "./components/Brower";
import { Overlay } from "./components/Overlay";
import { Teams } from "./components/Teams";
import { Start } from "./components/Start";

export const App = () => {
  //Websocket更新時にState更新

  return (
    <div className="flex flex-wrap">
      {/* Browserは内部にupdateもってるよ */}
        <Start />
        {/* <Browser />
        <Teams />
        <Overlay /> */}
        
      {/* Teamは内部にupdateもってるよ */}
    </div>
  );
};
