import path from "path";
import {unlink} from "fs";
import { BrowserWindow, app, ipcMain } from "electron";
import { socketComm } from "./api/socketComm";
import { SheetService } from "./api/spread";
import { DriveService } from "./api/gdrive";
import { getHashesFromFolder } from "./api/hash";
import {encode,decode} from "iconv-lite";

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
});

ipcMain.handle("getDrive",async (e,d:string) => {
  return await ds.filesFromFolderID(d).catch(console.error);
});

ipcMain.handle("glob",async () => {
  return await getHashesFromFolder(String.raw`C:\Users\kazum\Desktop\programings\GBC_dev\graphics\images`,/.*\.(jpg|png)$/);
});

ipcMain.handle("download",(e,data:string[]) => {
  const [id,path] = data;
  console.log(id,path);
  return ds.downloadFileFromID(id,path).catch(console.error);
});

ipcMain.handle("path.join",(e,data:string[]) => path.join(...data));
ipcMain.handle("iconv",(e,d:string) => decode(encode(d,"utf8"), "utf8"));
ipcMain.handle("removeFile",(e,d:string) => unlink(d,(e) => console.error(e)));
})();