import { useState } from "react";
import { Browser } from "./components/Brower";
import { Overlay } from "./components/Overlay";
import { Props } from "./components/BrowserBands";
import { Teams } from "./components/Teams";
const updateState = (setBadges: React.Dispatch<React.SetStateAction<Props[]>>) => {
  window.app.on(
    "connections",
    (e: Electron.IpcRendererEvent, data: Record<string, boolean>) => {
      let list: Props[] = [];
      Object.keys(data).forEach((key) => {
        list.push({ connection: data[key], path: key });
      });
      setBadges(list);
    }
  );

};

const updateIsAuthed = (setIsAuthed:React.Dispatch<React.SetStateAction<boolean>>) => {
  window.app.on("gdrive:isAuthed",(e:any,isAuthed:boolean) => {
      console.log(isAuthed);
      setIsAuthed(isAuthed);
  })
}




export const App = () => {
  const defaultProps = [
    { path: "/icon", connection: false },
    { path: "/score", connection: false },
    { path: "/playerName", connection: false },
    { path: "/team", connection: false },
    { path: "/transition", connection: false },
  ];

  const [badges, setBadges] = useState(defaultProps);
  const [isAuthed,setIsAuthed] = useState(false);

  //Websocket更新時にState更新
  updateState(setBadges);
  updateIsAuthed(setIsAuthed);
  return (
    <div className="flex">
      <Browser badgelist={badges} />
      <Overlay isAuthed={isAuthed}/>
      {/* Teamは内部にupdateもってるよ */}
      <Teams />
    </div>
  );
};
