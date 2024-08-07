import { BrowserWindow, app, ipcMain } from 'electron';
import { DriveService } from './api/gdrive';
import { SheetService } from './api/spread';
import { unlink, mkdirSync, PathLike, readFileSync } from 'fs';
import { getHashesFromFolder } from './api/hash';
import { encode, decode } from 'iconv-lite';
import path from 'path';
import { socketComm } from './api/socketComm';
import { ws_onConnection_type } from "./common/types";
import {Caches } from "./api/caches"
// import { start as MocaApiInit } from './api/start';
import { New_start } from "./api/new_start"
import { setPointModule } from './api/setPointModule';

// TODO env使わないようにしたい
require('dotenv').config();

class Moca {
  ss = new SheetService();
  ds = new DriveService();
  setPointModule = new setPointModule();
  mainWindow: BrowserWindow;
  socket: socketComm;
  caches: Caches = new Caches();
  new_start: New_start | undefined = undefined;
  constructor() {
    this.mainWindow = this.createWindow();
    this.socket = new socketComm();
  }
  main() {
    this.socket.bind();
    // Cacheのイベントリスナー設置
    this.set_cmd_listener();
    // onConnectionのイベントリスナー設置
    this.set_onConnection_listener();

    //あとでDIみたいにする
    this.mainWindow.webContents.on('did-finish-load', () =>{
      this.new_start = new New_start(this.ss,this.ds,this.mainWindow);
      this.new_start.authorization();
    }
    );
    this.setHandles();

  }

  
  private createWindow = () => {
    const mainWindow = new BrowserWindow({
      width: 995,
      height: 514+100,
      webPreferences: {
        preload: path.resolve(__dirname, 'preload.js')
      }
    });
    mainWindow.loadFile('dist/index.html');
    // mainWindow.webContents.openDevTools({ mode: "detach" });
    return mainWindow;
  };

  // cmd_listenerの設定
  private set_cmd_listener = () => {
    this.socket.add_cmd_listener(this.caches.create_cmd_function());
    this.socket.add_cmd_listener(this.setPointModule.create_cmd_function(this.socket));
  }

  // onConnectionの設定 
  private set_onConnection_listener = () => {
    this.socket.add_onConnection_listener(this.ss.create_onConnection_function());
    this.socket.add_onConnection_listener(this.caches.create_onConnection_function());
    this.socket.add_onConnection_listener(this.createSocketOnConnectionCallback());
    this.socket.add_onConnection_listener(this.setPointModule.create_onConnection_function());
  }

  createSocketOnConnectionCallback = (): ws_onConnection_type => {
    const onConnection: ws_onConnection_type = (ws) => {
      ws.send(
        JSON.stringify({ cmd: 'imgPath', data: process.env.GRAPHICS_DIR })
      );
    };
    return onConnection;
  };

  private setHandles = () => {

    ipcMain.handle('setMatchingScore', (e, input) => {
      this.setPointModule.setMatchingScore = input;
      this.socket.sendData('/boost', {
        cmd: 'currentScore',
        data: this.setPointModule.matchingScore
      });
    });

    ipcMain.handle('setGameScore', (e, input) => {
      this.setPointModule.setGameScore = input;
      this.socket.sendData('/boost', { cmd: 'setPoint', data: this.setPointModule.gameScore });
    });

    ipcMain.handle('sendSocketCommunication', (e, input) => {
      return this.socket.sendSocket(input);
    });

    ipcMain.handle('readFile', (e, path) => {
      return readFileSync(path).toString();
    });

    ipcMain.handle('sendSocket', (e, input) => {
      const { path, data } = input;
      return this.socket.sendData(path, data);
    });
    ipcMain.handle('stream', (e, input) => {
      return this.socket.stream(input);
    });
    ipcMain.handle('connectedBrowsers', () => {
      return this.socket.connectedBrowsers;
    });

    ipcMain.handle('spread:loadTeams', async () => {
      return await this.ss.loadTeams();
    });
    ipcMain.handle('spread:getMatchInfo', async () => {
      return await this.ss.getMatchInfo();
    });
    ipcMain.handle('getIdTable', () => {
      return this.ss.getIds();
    });
    ipcMain.handle('cachedMatchInfo', () => {
      return this.ss.matchInfo;
    });

    // ipcMain.handle('SPREADSHEET_ID', () => {
    //   return process.env.SPREADSHEET_ID;
    // });

    ipcMain.handle('GOOGLEDRIVE_ID', () => {
      return this.new_start?.drive_id || "";
    });

    ipcMain.handle('getDrive', async (e, d: string) => {
      return await this.ds.filesFromFolderID(d).catch(console.error);
    });

    ipcMain.handle('glob', async () => {
      return await getHashesFromFolder(
        this.new_start?.download_directory_path || "",
        /.*\.(jpg|png|mp4)$/
      );
    });

    ipcMain.handle('download', (e, data: string[]) => {
      const [id, path] = data;
      console.log(id, path);
      return this.ds.downloadFileFromID(id, path).catch(console.error);
    });
    ipcMain.handle('mkdir', (e, path: PathLike) => mkdirSync(path));

    ipcMain.handle('path.join', (e, data: string[]) => path.join(...data));
    ipcMain.handle('iconv', (e, d: string) =>
      decode(encode(d, 'utf8'), 'utf8')
    );
    ipcMain.handle('removeFile', (e, d: string) =>
      unlink(d, (e) => console.error(e))
    );
    // ipcMain.handle('spread:setSheetID', (e, d: string) =>
    //   this.ss.setSheetID(d)
    // );
    // ipcMain.handle('spread:auth', () =>
    //   this.ss.auth().catch((e) => {
    //     console.log(e);
    //     return false;
    //   })
    // );
    // ipcMain.handle('spread:hasPrivateKey', () => this.ss.hasPrivateKey());
    // ipcMain.handle('gdrive:auth', (e, d: string) =>
    //   this.ds.clientCheck(d).catch((e) => {
    //     console.log(e);
    //     return false;
    //   })
    // );
    ipcMain.handle('graphics_dir', () => this.new_start?.download_directory_path);
  };
}

(async () => {
  app.whenReady().then(() => {
    console.log("app loaded!")
    const moca = new Moca();
    moca.main();
  });
  app.once('window-all-closed', () => app.quit());
})();
