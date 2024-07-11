import { Browser } from "./components/Brower";
import { Overlay } from "./components/Overlay";
import { Teams } from "./components/Teams";
import { Start } from "./components/Start";
import { New_start } from "./components/New_start";
import { IdTable } from "./components/IdTable";
import { Debug } from "./components/Debug";
import {MemoryRouter as Router,Routes,Route,Navigate} from "react-router-dom";
import { Topper } from "./components/Main";


const Spread = () => {
  return(
    <div className="flex">
      <Teams/><IdTable/>
    </div>
  )
}

export const App = () => {
  //Websocket更新時にState更新
  console.log(window.location.pathname);
  return (
    <div>
      {/* Browserは内部にupdateもってるよ */}
      {/* {useLocation().pathname !== "/" ?? <Topper/>} */}
        <Router>
          <Routes>
            {/* <Route path="/" element={<Start/>} /> */}
            <Route path="/" element={<New_start/>} />
            {/* Topperと下のDynamicで分ける */}
            <Route path="/overlay" element={<Topper/>}>
              <Route index element={<Navigate to="/overlay/browser" replace/>}/>
              <Route path="browser" element={<Browser/>}/>
              <Route path="spread" element={<Spread/>}/>
              <Route path="drive" element={<Overlay/>}/>
              <Route path="debug" element={<Debug/>}></Route>
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
