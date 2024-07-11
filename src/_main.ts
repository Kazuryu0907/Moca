import { BrowserWindow, app, ipcMain } from 'electron';
import { DriveService } from './api/gdrive';
import { SheetService } from './api/spread';
import { authorization } from "./new_start"
import path from "path";
import {mkdirSync} from "fs"

require('dotenv').config();
mkdirSync(path.join(__dirname,"env"),{recursive:true});
class Moca {
  ss = new SheetService();
  ds = new DriveService();
  mainWindow: BrowserWindow;
  constructor() {
    this.mainWindow = this.createWindow();
  }
  main() {
    //あとでDIみたいにする
    this.mainWindow.webContents.on('did-finish-load', () =>
      authorization(this.ss,this.ds,this.mainWindow)
      // MocaApiInit(process.env, this.ss, this.ds, this.socket, this.mainWindow)
    );
    // this.setHandles();
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

}


(async () => {
  app.whenReady().then(() => {
    const moca = new Moca();
    moca.main();
  });
  app.once('window-all-closed', () => app.quit());
})();
