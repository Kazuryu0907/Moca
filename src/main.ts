import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";
import { socketComm } from "./api/socketComm";
import { SheetService } from "./api/spread";
import { DriveService } from "./api/gdrive";
(async ()=>{
const ss = new SheetService();
let ds:DriveService;
await ss.init();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("dist/index.html");

  socketComm(mainWindow);//
  ds = new DriveService(mainWindow);
  ds.init();
  mainWindow.webContents.openDevTools({ mode: "detach" });
};


app.whenReady().then(() => {
  createWindow();
});

app.once("window-all-closed", () => app.quit());



//handles
ipcMain.handle("getTeam",async (event,data) => {
  return await ss.getTeamName();
})

ipcMain.handle("getDrive",async (e,d:string) => {
  const FOLDER_ID = "1OzMEBHzkxbodHRL2rRVopIEh2B0c1JJu";
  const SAVE_DIR = "./graphics";
  // return ds.isAuthed;
  return await ds.filesFromFolderID(d).catch(console.error);
})

})();