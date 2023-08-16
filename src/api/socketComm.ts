import * as dgram from "dgram";
import {WebSocketServer,WebSocket} from "ws";
import {BrowserWindow} from "electron";
import {Browsers,BrowserType} from "../web/components/types";

type DataType = {
  cmd:string,
  data:any
};

type onConnectionType = (ws:WebSocket) => void;
//Record初期化
function initRecord<Y>(arr:readonly string[],defaultVal:Y){
  const toReturn:Record<string,Y> = {};
  arr.forEach(keys => {
    toReturn[keys] = defaultVal;
  });
  return toReturn;
}

export class socketComm{
  mainWindow:BrowserWindow|undefined = undefined;
  connectedBrowsers:Record<BrowserType,boolean> = initRecord<boolean>(Browsers,false);
  clients: Record<BrowserType,WebSocket|null>= initRecord<null>(Browsers,null);
  //接続時に実行するHook
  onConnection:onConnectionType = (ws:WebSocket) => {};

  constructor(mainWindow: BrowserWindow){
    this.mainWindow = mainWindow;
  }
  

  sendData(path:BrowserType,data:DataType){
      this.clients[path]?.send(JSON.stringify(data));
  }

  stream(data:DataType){
    Browsers.forEach((path) => {
      this.clients[path]?.send(JSON.stringify(data));
    })
  }

  bind(){
    const port = 12345;
    const host = "127.0.0.1";

    const socket = dgram.createSocket("udp4");

    socket.on("listening",() => {
        const addr = socket.address();
        console.log(`UDP socket listening on ${addr.address}:${addr.port}`);
    })

    const s = new WebSocketServer({port:8001});


    socket.on("message",(msg,remote) => {
        // console.log(`${remote.address}:${remote.port} - ${msg}`);
        const data = msg.toString();
        console.log(data);
        this.sortingData(JSON.parse(data));
    });

    socket.bind(port, host);

    const isBrowser = (path:string): path is BrowserType => {
      return Browsers.some((v) => v === path);
    }

    //WebSocket
    s.on("connection",(ws,req) => {
      const path = req.url || "";
      console.log(path);
      if(isBrowser(path)){
        this.clients[path] = ws;
        this.connectedBrowsers[path] = true;
        this.mainWindow!.webContents.send("connections",this.connectedBrowsers);
        console.log(this.connectedBrowsers);
        this.onConnection(ws);
      }

      ws.on("close",(s) => {
        if(isBrowser(path)){
          this.clients[path] = null;
          this.connectedBrowsers[path] = false;
          this.mainWindow!.webContents.send("connections",this.connectedBrowsers);
        }
        // console.log(clients);
      });

      console.log(this.connectedBrowsers);
    });
  }

  sortingData(input:{"cmd":string,"data":any}){
    const cmd = input.cmd;
    if(cmd == "playerTable"){
      this.stream({cmd:"playerTable","data":input.data});
    }else if(cmd == "boost"){
      const data:{"boost":number,"index":number} = input.data;
      this.sendData("/boost",{cmd:"boost",data:data});
    }else if(cmd == "stats"){
      this.sendData("/stats",{cmd:"stats",data:input.data});
    }else if(cmd == "player"){
      this.sendData("/boost",{cmd:"player",data:input.data});
    }
  }
}
