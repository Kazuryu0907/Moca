import * as dgram from 'dgram';
import { WebSocketServer, WebSocket } from 'ws';
import { Browsers, BrowserType} from "../common/types";
import { socket_command_type, ws_onConnection_type } from "../common/types";
import { ws_cmd_type, ws_cmd_func_type, ws_add_cmd_listener_type } from "../common/types";

export type DataType = {
  cmd: string;
  data: any;
};


//Record初期化
function initRecord<Y>(arr: readonly string[], defaultVal: Y) {
  const toReturn: Record<string, Y> = {};
  arr.forEach((keys) => {
    toReturn[keys] = defaultVal;
  });
  return toReturn;
}


export class socketComm {
  connectedBrowsers: Record<BrowserType, boolean> = initRecord<boolean>(
    Browsers,
    false
  );
  clients: Record<BrowserType, WebSocket | null> = initRecord<null>(
    Browsers,
    null
  );
  socket: dgram.Socket = dgram.createSocket('udp4');
  event_cmds:ws_cmd_func_type[] = [];
  onConnection_cmds:ws_onConnection_type[] = [];

  // setPointModuleはDebugで使用できるように外で宣言
  constructor() {
    // eventlistener設定
    this.add_cmd_listener(this.create_cmd_function());
  }


  bind() {
    const port = 12345;
    const host = '127.0.0.1';

    this.socket.on('listening', () => {
      const addr = this.socket.address();
      console.log(`UDP socket listening on ${addr.address}:${addr.port}`);
    });

    let s: WebSocketServer;
    try{
      s = new WebSocketServer({ port: 8001 });
    }catch(e){
      console.error(e);
      return;
    }

    this.socket.on('message', (msg, ) => {
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

    //WebSocket
    s.on('connection', (ws, req) => {
      const path = req.url as BrowserType;
      console.log(path);
      // *onConnected
      if (this.isBrowser(path)) {
        this.clients[path] = ws;
        this.connectedBrowsers[path] = true;
        this.onConnection_cmds.forEach((func) => func(ws,path));
      }
      // *onClosed
      ws.on('close', () => {
        if (this.isBrowser(path)) {
          this.clients[path] = null;
          this.connectedBrowsers[path] = false;
        }
        // console.log(clients);
      });

      // *onMessage
      // controllerからMessageが来た時，全てのBrowserに送信
      ws.on("message",(msg) => {
        if(req.url == "/controller"){
          const data = msg.toString();
          const json = JSON.parse(data);
          this.sendData("/boost",json);
          console.log(data);
        }
      })
    });
  }

  private isBrowser(path:string): path is BrowserType{
    return Browsers.some((v) => v === path);
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
  add_cmd_listener(input:ws_add_cmd_listener_type){
    if(Array.isArray(input)){
      input.forEach((func) => this.event_cmds.push(func));
    }else{
      this.event_cmds.push(input);
    }
  }

  add_onConnection_listener(func:ws_onConnection_type){
    this.onConnection_cmds.push(func);
  }
  private run_cmd_listener(input:{cmd:socket_command_type,data:any}){
    this.event_cmds.forEach((func) => func(input));
  }
  private create_cmd_function(){
    const cmd_func = (input:ws_cmd_type) => {
      const cmd = input.cmd;
      const data = input.data;
      // 全cmdそのまま送信
      this.sendData("/boost",{cmd:cmd,data:data});
      // これだけstream
      if(cmd == "playerTable"){
        this.stream({cmd:"playerTable",data:data});
      }
    }
    return cmd_func;
}

  sendSocket(data: string) {
    this.socket.send(data, 12345, '127.0.0.1');
  }

}
