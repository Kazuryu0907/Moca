import path from "path";
import {WebSocket} from "ws";
import {unlink,mkdirSync, PathLike} from "fs";
import { BrowserWindow, app, ipcMain } from "electron";
import { socketComm } from "./api/socketComm";
import { SheetService } from "./api/spread";
import { DriveService } from "./api/gdrive";
import { getHashesFromFolder } from "./api/hash";
import {encode,decode} from "iconv-lite";
import {start} from "./api/start";
//`C:\Users\kazum\Desktop\programings\electron\electron-react-ts\src`
//D:\github\Moca\src
const envPath = path.join(String.raw`D:\github\Moca\src`,".env");
require("dotenv").config({path:envPath});

let mainWindow:BrowserWindow;
let socket:socketComm;


(async ()=>{
let ss:SheetService;
let ds:DriveService;
// await ss.init();
ds = new DriveService();
ss = new SheetService(process.env);

const socketInit = () => {
  const _socket = new socketComm(mainWindow);
  socket = _socket;
  _socket.onConnection = (ws:WebSocket) => {
    const idTable = ss.idTable;
    const playerTable = {cmd:"playerTable",data:idTable};
    ws.send(JSON.stringify(playerTable));
  };
  _socket.bind();
  //idTableの自動取得
  _socket.onConnection = (ws:WebSocket) => {
    const idTable = ss.idTable;
    let root = {cmd:"idTable",data:idTable};
    ws.send(JSON.stringify(root));
    const matchInfo = ss.matchInfo;
    ws.send(JSON.stringify({cmd:"matchInfo",data:matchInfo}));
  }
}

const createWindow = () => {
  const _mainWindow = new BrowserWindow({
    width:995,
    height:514,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
    },
  });
  mainWindow = _mainWindow;
  mainWindow.loadFile("dist/index.html");
  mainWindow.webContents.openDevTools({ mode: "detach" });
  mainWindow.webContents.on('did-finish-load',() => start(process.env,ss,ds,socket,mainWindow));
};

app.whenReady().then(async() => {
  createWindow();
  socketInit();
});


app.once("window-all-closed", () => app.quit());

//---------------handles--------------------------

ipcMain.handle("sendSocket",(e,input) => {
  const {path,data} = input;
  return socket.sendData(path,data);
})
ipcMain.handle("stream",(e,input) => {
  return socket.stream(input);
})

ipcMain.handle("connectedBrowsers",() => {
  return socket.connectedBrowsers;
})

ipcMain.handle("spread:loadTeams",async() => {
  return await ss.loadTeams();
})
ipcMain.handle("spread:getMatchInfo",async () => {
  return await ss.getMatchInfo();
});
ipcMain.handle("getIdTable",() => {
  return ss.getIds();
})
ipcMain.handle("cachedMatchInfo",() => {
  return ss.matchInfo;
})


ipcMain.handle("SPREADSHEET_ID",() => {
  return process.env.SPREADSHEET_ID;
});

ipcMain.handle("GOOGLEDRIVE_ID",() => {
  return process.env.GOOGLEDRIVE_ID;
})

ipcMain.handle("getDrive",async (e,d:string) => {
  return await ds.filesFromFolderID(d).catch(console.error);
});

ipcMain.handle("glob",async () => {
  return await getHashesFromFolder(process.env.GRAPHICS_DIR!,/.*\.(jpg|png)$/);
});

ipcMain.handle("download",(e,data:string[]) => {
  const [id,path] = data;
  console.log(id,path);
  return ds.downloadFileFromID(id,path).catch(console.error);
});
ipcMain.handle("mkdir",(e,path:PathLike) => mkdirSync(path));

ipcMain.handle("path.join",(e,data:string[]) => path.join(...data));
ipcMain.handle("iconv",(e,d:string) => decode(encode(d,"utf8"), "utf8"));
ipcMain.handle("removeFile",(e,d:string) => unlink(d,(e) => console.error(e)));
ipcMain.handle("spread:setSheetID",(e,d:string) => ss.setSheetID(d));
ipcMain.handle("spread:auth",() => ss.auth().catch((e) =>{
  console.log(e);
  return false;
}));
ipcMain.handle("spread:hasPrivateKey",() => ss.hasPrivateKey());
ipcMain.handle("gdrive:auth",(e,d:string) => ds.clientCheck(d).catch((e) => {
  console.log(e);
  return false;
}));
ipcMain.handle("graphics_dir",() => process.env.GRAPHICS_DIR!);

})();