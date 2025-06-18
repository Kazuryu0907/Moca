import React from "react";
import { Browser } from "./components/Brower";
import { ControllerAccess } from "./components/ControllerAccess";
import { Overlay } from "./components/Overlay";
import { Teams } from "./components/Teams";
// import { Start } from "./components/Start";
import { MemoryRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthStatus } from "./components/AuthStatus";
import { Debug } from "./components/Debug";
import { IdTable } from "./components/IdTable";
import { Topper } from "./components/Main";
import { New_start } from "./components/New_start";

const Spread = () => {
  return (
    <div className="flex">
      <Teams />
      <IdTable />
    </div>
  );
};

export const App = () => {
  // Websocket更新時にState更新
  console.log(window.location.pathname);
  return (
    <div>
      {/* Browserは内部にupdateもってるよ */}
      {/* {useLocation().pathname !== "/" ?? <Topper/>} */}
      <Router>
        <Routes>
          {/* <Route path="/" element={<Start/>} /> */}
          <Route path="/" element={<AuthStatus />} />
          {/* <Route path="/legacy" element={<New_start />} /> */}
          {/* Topperと下のDynamicで分ける */}
          <Route path="/overlay" element={<Topper />}>
            <Route index element={<Navigate to="/overlay/browser" replace />} />
            {/* <Route index path="browser" element={<ControllerAccess />} /> */}
            <Route index path="spread" element={<Spread />} />
            <Route path="drive" element={<Overlay />} />
            <Route path="debug" element={<Debug />}></Route>
            <Route path="*" element={<Navigate to="/overlay/browser" replace />} />
          </Route>
        </Routes>
      </Router>
      {
        /* <Browser />
        <Teams />
        <Overlay /> */
      }

      {/* Teamは内部にupdateもってるよ */}
    </div>
  );
};
