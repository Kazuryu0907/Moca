import * as dgram from 'dgram';
import { WebSocketServer, WebSocket } from 'ws';
import { BrowserWindow } from 'electron';
import { Browsers, BrowserType } from '../web/components/types';
import { setPointModule } from './setPointModule';
import { socket_command_type } from "../common/types";

export type DataType = {
  cmd: string;
  data: any;
};

export type onConnectionType = (ws: WebSocket) => void;
export type cmd_type = {cmd:socket_command_type,data:any};
export type cmd_func_type = (input:cmd_type) => void;
export type add_cmd_listener_type = ((input:cmd_type) => void)|((input:cmd_type) => void)[];
//Record初期化
function initRecord<Y>(arr: readonly string[], defaultVal: Y) {
  const toReturn: Record<string, Y> = {};
  arr.forEach((keys) => {
    toReturn[keys] = defaultVal;
  });
  return toReturn;
}

class Caches {
  stats: Object = {};
  setPoint: Object = {};
  currentScore: { blue: number; orange: number } = { blue: 0, orange: 0 };
}

export class socketComm {
  mainWindow: BrowserWindow;
  connectedBrowsers: Record<BrowserType, boolean> = initRecord<boolean>(
    Browsers,
    false
  );
  clients: Record<BrowserType, WebSocket | null> = initRecord<null>(
    Browsers,
    null
  );
  caches: Caches = new Caches();
  setPointModule:setPointModule;
  event_cmds:cmd_func_type[] = [];
  onConnection_cmds:Function[] = [];


  //接続時に実行するHook
  onConnection: onConnectionType = () => {};
  socket: dgram.Socket = dgram.createSocket('udp4');
  // setPointModuleはDebugで使用できるように外で宣言
  constructor(mainWindow: BrowserWindow,setPointModule: setPointModule) {
    this.mainWindow = mainWindow;
    this.setPointModule = setPointModule;
    this.set_websocket_listener();
  }

  sendData(path: BrowserType | BrowserType[], data: DataType) {
    // BrowserType[]の時
    if(Array.isArray(path)){
      path.forEach((p) => {
        this.clients[p]?.send(JSON.stringify(data));
      });
      return;
    // BrowserTypeの時
    }else {
      this.clients[path]?.send(JSON.stringify(data));
    }
  }

  stream(data: DataType) {
    Browsers.forEach((path) => {
      this.clients[path]?.send(JSON.stringify(data));
    });
  }

  bind() {
    const port = 12345;
    const host = '127.0.0.1';

    this.socket.on('listening', () => {
      const addr = this.socket.address();
      console.log(`UDP socket listening on ${addr.address}:${addr.port}`);
    });

    const s = new WebSocketServer({ port: 8001 });

    this.socket.on('message', (msg, ) => {
      // console.log(`${remote.address}:${remote.port} - ${msg}`);
      const data = msg.toString();
      try {
        if (JSON.parse(data).cmd != 'boost') console.log(data);
        this.run_cmd_listener(JSON.parse(data));
        // this.sortingData(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    });

    this.socket.bind(port, host);
    const isBrowser = (path: string): path is BrowserType => {
      return Browsers.some((v) => v === path);
    };

    //WebSocket
    s.on('connection', (ws, req) => {
      const path = req.url || '';
      console.log(path);
      if (isBrowser(path)) {
        this.setPointModule.onAccessHtml(path,this);
        this.clients[path] = ws;
        this.connectedBrowsers[path] = true;
        this.mainWindow!.webContents.send(
          'connections',
          this.connectedBrowsers
        );
        // console.log(this.connectedBrowsers);
        // this.onConnection(ws);
        this.onConnection_cmds.forEach((func) => func(ws));
      }

      ws.on('close', () => {
        if (isBrowser(path)) {
          this.clients[path] = null;
          this.connectedBrowsers[path] = false;
          this.mainWindow.webContents.send(
            'connections',
            this.connectedBrowsers
          );
        }
        // console.log(clients);
      });
    });
  }

  add_cmd_listener(input:add_cmd_listener_type){
    if(Array.isArray(input)){
      input.forEach((func) => this.event_cmds.push(func));
    }else{
      this.event_cmds.push(input);
    }
  }

  add_onConnection_listener(func:() => void){
    this.onConnection_cmds.push(func);
  }
  private run_cmd_listener(input:{cmd:socket_command_type,data:any}){
    this.event_cmds.forEach((func) => func(input));
  }
  private set_websocket_listener(){
    const cmd_func = (input:cmd_type) => {
      const cmd = input.cmd;
      const data = input.data;
      this.sendData("/boost",{cmd:cmd,data:data});
      if(cmd == "playerTable"){
        this.stream({cmd:"playerTable",data:data});
      }
    }
    this.add_cmd_listener(cmd_func);
}

  sendSocket(data: string) {
    this.socket.send(data, 12345, '127.0.0.1');
  }

}
