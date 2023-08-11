import { useState } from "react";
import { Browser } from "./components/Brower";
import { Overlay } from "./components/Overlay";
import { Teams } from "./components/Teams";
import { Start } from "./components/Start";
import { IdTable } from "./components/IdTable";
import {MemoryRouter as Router,Routes,Route,Navigate} from "react-router-dom";
import { Main,Topper } from "./components/Main";

export const App = () => {
  //Websocket更新時にState更新
  console.log(window.location.pathname);
  return (
    <div>
      {/* Browserは内部にupdateもってるよ */}
      {/* {useLocation().pathname !== "/" ?? <Topper/>} */}
        <Router>
          <Routes>
            <Route path="/" element={<Start/>} />
            {/* Topperと下のDynamicで分ける */}
            <Route path="/overlay" element={<Topper/>}>
              <Route index element={<Navigate to="/overlay/browser" replace/>}/>
              <Route path="browser" element={<Browser/>}/>
              <Route path="spread" element={<><Teams/><IdTable/></>}/>
              <Route path="drive" element={<Overlay/>}/>
              <Route path="*" element={<Navigate to="/overlay/browser" replace/>}/>
            </Route>
          </Routes>
        </Router>
        {/* <Browser />
        <Teams />
        <Overlay /> */}
        
      {/* Teamは内部にupdateもってるよ */}
    </div>
  );
};
