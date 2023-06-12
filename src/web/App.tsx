import { useState } from "react";
import { Browser } from "./components/Brower";
import { Overlay } from "./components/Overlay";
import { Teams } from "./components/Teams";


export const App = () => {

  //Websocket更新時にState更新

  return (
    <div className="flex">
      {/* Browserは内部にupdateもってるよ */}
        <Browser />
        <Teams />
        <Overlay />
      {/* Teamは内部にupdateもってるよ */}
    </div>
  );
};
