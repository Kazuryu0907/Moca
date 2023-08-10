import { useState } from "react";
import { Browser } from "./components/Brower";
import { Overlay } from "./components/Overlay";
import { Teams } from "./components/Teams";
import { Start } from "./components/Start";
import { IdTable } from "./components/IdTable";
import {MemoryRouter as Router,Routes,Route} from "react-router-dom";

export const App = () => {
  //Websocket更新時にState更新

  return (
    <div>
      {/* Browserは内部にupdateもってるよ */}
        <Router>
          <Routes>
            <Route path="/" element={<Start/>} />
            <Route path="/overlay" element={<div className="flex"><Teams/><IdTable/></div>}/>
          </Routes>
        </Router>
        {/* <Browser />
        <Teams />
        <Overlay /> */}
        
      {/* Teamは内部にupdateもってるよ */}
    </div>
  );
};
