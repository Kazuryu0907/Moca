import { New_start } from "./components/New_start";


export const App = () => {
  //Websocket更新時にState更新
  console.log(window.location.pathname);
  return (
    <div>
      {/* Browserは内部にupdateもってるよ */}
      {/* {useLocation().pathname !== "/" ?? <Topper/>} */}
      <New_start/>
        {/* <Browser />
        <Teams />
        <Overlay /> */}
        
      {/* Teamは内部にupdateもってるよ */}
    </div>
  );
};
