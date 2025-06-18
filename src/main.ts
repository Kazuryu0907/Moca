import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { mkdirSync, PathLike, readFileSync, unlink } from 'fs';
import { decode, encode } from 'iconv-lite';
import path from 'path';
import { AuthManager } from './api/auth/AuthManager';
import { Caches } from './api/caches';
import { DriveService } from './api/google_drive';
import { getHashesFromFolder } from './api/hash';
import { SetPointModule } from './api/set_point';
import { SocketComm } from './api/socket_communication';
import { SheetService } from './api/google_spreadsheet';
import { WsOnConnectionType } from './common/types';

class Moca {
  ss = new SheetService();
  ds = new DriveService();
  setPointModule = new SetPointModule();
  mainWindow: BrowserWindow;
  socket: SocketComm;
  caches: Caches = new Caches();
  authManager: AuthManager | undefined = undefined;
  constructor() {
    this.mainWindow = this.createWindow();
    this.socket = new SocketComm();
  }
  main() {
    // あとでDIみたいにする
    this.mainWindow.webContents.on('did-finish-load', async () => {
      this.authManager = new AuthManager(this.ss, this.ds, this.mainWindow);
      const authResult = await this.authManager.authenticate();
      if (!authResult.success) {
        console.error('認証に失敗しました:');
        authResult.errors.forEach((error) => console.error(' -', error));
        return;
      }
      console.log('認証が完了しました。アプリケーションを開始します。');
      this.socket.bind();
      // Cacheのイベントリスナー設置
      this.set_cmd_listener();
      // onConnectionのイベントリスナー設置
      this.set_onConnection_listener();
    });
    this.setHandles();
  }

  private createWindow = () => {
    const mainWindow = new BrowserWindow({
      width: 995,
      height: 514 + 100,
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
    this.socket.add_cmd_listener(
      this.setPointModule.create_cmd_function(this.socket)
    );
  };

  // onConnectionの設定
  private set_onConnection_listener = () => {
    this.socket.add_onConnection_listener(
      this.ss.create_onConnection_function()
    );
    this.socket.add_onConnection_listener(
      this.caches.create_onConnection_function()
    );
    this.socket.add_onConnection_listener(
      this.createSocketOnConnectionCallback()
    );
    this.socket.add_onConnection_listener(
      this.setPointModule.create_onConnection_function()
    );
  };

  createSocketOnConnectionCallback = (): WsOnConnectionType => {
    const onConnection: WsOnConnectionType = (ws) => {
      ws.send(
        JSON.stringify({
          cmd: 'imgPath',
          data: this.authManager?.downloadDirectory
        })
      );
    };
    return onConnection;
  };

  private setHandles = () => {
    ipcMain.handle('openBrowser', (e, url) => shell.openExternal(url));

    ipcMain.handle('setMatchingScore', (e, input) => {
      this.setPointModule.setMatchingScore = input;
      this.socket.sendData('/boost', {
        cmd: 'currentScore',
        data: this.setPointModule.matchingScore
      });
    });

    ipcMain.handle('setGameScore', (e, input) => {
      this.setPointModule.setGameScore = input;
      this.socket.sendData('/boost', {
        cmd: 'setPoint',
        data: this.setPointModule.gameScore
      });
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
    ipcMain.handle('GOOGLEDRIVE_ID', () => {
      return this.authManager?.driveId || '';
    });
    ipcMain.handle('getDrive', async (e, d: string) => {
      return await this.ds.filesFromFolderID(d).catch(console.error);
    });
    ipcMain.handle('glob', async () => {
      return await getHashesFromFolder(
        this.authManager?.downloadDirectory || '',
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
    ipcMain.handle('graphics_dir', () => this.authManager?.downloadDirectory);
  };
}

(async () => {
  app.whenReady().then(() => {
    console.log('app loaded!');
    const moca = new Moca();
    moca.main();
  });
  app.once('window-all-closed', () => {
    app.quit();
  });
})();
