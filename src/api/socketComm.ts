import * as dgram from 'dgram';
import { WebSocketServer, WebSocket } from 'ws';
import { BrowserWindow } from 'electron';
import { Browsers, BrowserType } from '../web/components/types';
import { setPointModule } from './setPointModule';

export type DataType = {
  cmd: string;
  data: any;
};

export type onConnectionType = (ws: WebSocket) => void;
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

  //接続時に実行するHook
  onConnection: onConnectionType = (ws: WebSocket) => {};
  socket: dgram.Socket = dgram.createSocket('udp4');
  // setPointModuleはDebugで使用できるように外で宣言
  constructor(mainWindow: BrowserWindow,setPointModule: setPointModule) {
    this.mainWindow = mainWindow;
    this.setPointModule = setPointModule;
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

    this.socket.on('message', (msg, remote) => {
      // console.log(`${remote.address}:${remote.port} - ${msg}`);
      const data = msg.toString();
      try {
        if (JSON.parse(data).cmd != 'boost') console.log(data);
        this.sortingData(JSON.parse(data));
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
        this.onConnection(ws);
      }

      ws.on('close', (s) => {
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

  sortingData(input: { cmd: string; data: any }) {
    const cmd = input.cmd;
    // setPointModuleへUDPを横流し
    this.setPointModule.hook(input,this);
    if (cmd == 'start') {
      //得点管理
      this.sendData('/boost', { cmd: 'start', data: 0 });
    } else if (cmd == 'playerTable') {
      this.stream({ cmd: 'playerTable', data: input.data });
    } else if (cmd == 'boost') {
      const data: { boost: number; index: number } = input.data;
      this.sendData('/boost', { cmd: 'boost', data: data });
    } else if (cmd == 'stats') {
      this.sendData('/stats', { cmd: 'stats', data: input.data });
      //deepcopy
      this.caches.stats = JSON.parse(JSON.stringify(input.data));
    } else if (cmd == 'player') {
      this.sendData('/boost', { cmd: 'player', data: input.data });
    } else if (cmd == 'score') {
      this.sendData('/boost', { cmd: 'score', data: input.data });
    } else if (cmd == 'subScore') {
      this.sendData('/boost', { cmd: 'subScore', data: input.data });
    } else if (cmd == 'time') {
      this.sendData('/boost', { cmd: 'time', data: input.data });
    } else if (cmd == 'goals') {
      const data: {
        assistId: string;
        scoreId: string;
        team: 'blue' | 'orange';
      } = input.data;
      this.sendData('/boost', { cmd: 'goals', data: data });
    } else if (cmd == 'endStats') {
      this.sendData('/boost', { cmd: 'endStats', data: 0 });
    } else if (cmd == 'endReplay') {
      this.sendData('/boost', { cmd: 'endReplay', data: 0 });
    // } else if (cmd == 'setPoint') {
    //   this.sendData('/boost', { cmd: 'setPoint', data: input.data });
    //   this.caches.setPoint = JSON.parse(JSON.stringify(input.data));
    } else if (cmd == 'end') {
      this.sendData('/boost', { cmd: 'end', data: 0 });
    } else if(cmd == "matchId") {
      const data: {matchId: string} = input.data;
      this.sendData("/boost",{cmd: "matchId",data:data});
    } else if(cmd == "teamNames"){
      const data: {blue: string,orange: string,matchId:string} = input.data;
      this.sendData("/boost",{cmd: "teamNames",data:data});
    
    }
  }

  sendSocket(data: string) {
    this.socket.send(data, 12345, '127.0.0.1');
  }

}
