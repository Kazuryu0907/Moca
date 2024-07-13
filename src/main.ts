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
import { start as MocaApiInit } from './api/start';
import { New_start } from "./new_start"
import { setPointModule } from './api/setPointModule';

require('dotenv').config();

class Moca {
  ss = new SheetService();
  ds = new DriveService();
  setPointModule = new setPointModule();
  mainWindow: BrowserWindow;
  socket: socketComm;
  caches: Caches = new Caches();
  constructor() {
    this.mainWindow = this.createWindow();
    this.socket = new socketComm();
  }
  main() {
    this.socket.bind();
    // Cacheのイベントリスナー設置
    this.socket.add_cmd_listener(this.caches.create_cmd_function());
    // onConnectionのイベントリスナー設置
    this.socket.add_onConnection_listener(this.ss.create_onConnection_func());
    this.socket.add_onConnection_listener(this.caches.create_onConnection_function());
    this.socket.add_onConnection_listener(this.createSocketOnConnectionCallback());
    // this.socket.onConnection = this.createSocketOnConnectionCallback();
    //あとでDIみたいにする
    this.mainWindow.webContents.on('did-finish-load', () =>
      new New_start(this.ss,this.ds,this.mainWindow).authorization()
      // MocaApiInit(process.env, this.ss, this.ds, this.socket, this.mainWindow)
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

  createSocketOnConnectionCallback = (): ws_onConnection_type => {
    const onConnection: ws_onConnection_type = (ws) => {
      ws.send(
        JSON.stringify({ cmd: 'imgPath', data: process.env.GRAPHICS_DIR })
      );
      // ws.send(JSON.stringify({ cmd: 'idTable', data: this.ss.idTable }));
      // ws.send(JSON.stringify({ cmd: 'teamData', data: this.ss.teamData }));
      // ws.send(JSON.stringify({ cmd: 'matchInfo', data: this.ss.matchInfo }));
      // ws.send(JSON.stringify({ cmd: 'stats', data: this.socket.caches.stats }));
      //Moduleここに導入
      ws.send(
        JSON.stringify({
          cmd: 'setPoint',
          data: this.setPointModule.getGameScore
        })
      );
      ws.send(
        JSON.stringify({
          cmd: 'preMatchId',
          data: this.setPointModule.matchId
        })
      );
      ws.send(
        JSON.stringify({
          cmd: 'currentScore',
          data: this.setPointModule.matchingScore
        })
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

    ipcMain.handle('SPREADSHEET_ID', () => {
      return process.env.SPREADSHEET_ID;
    });

    ipcMain.handle('GOOGLEDRIVE_ID', () => {
      return process.env.GOOGLEDRIVE_ID;
    });

    ipcMain.handle('getDrive', async (e, d: string) => {
      return await this.ds.filesFromFolderID(d).catch(console.error);
    });

    ipcMain.handle('glob', async () => {
      return await getHashesFromFolder(
        process.env.GRAPHICS_DIR!,
        /.*\.(jpg|png)$/
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
    ipcMain.handle('spread:setSheetID', (e, d: string) =>
      this.ss.setSheetID(d)
    );
    ipcMain.handle('spread:auth', () =>
      this.ss.auth().catch((e) => {
        console.log(e);
        return false;
      })
    );
    ipcMain.handle('spread:hasPrivateKey', () => this.ss.hasPrivateKey());
    ipcMain.handle('gdrive:auth', (e, d: string) =>
      this.ds.clientCheck(d).catch((e) => {
        console.log(e);
        return false;
      })
    );
    ipcMain.handle('graphics_dir', () => process.env.GRAPHICS_DIR!);
  };
}

(async () => {
  app.whenReady().then(() => {
    const moca = new Moca();
    moca.main();
  });
  app.once('window-all-closed', () => app.quit());
})();
