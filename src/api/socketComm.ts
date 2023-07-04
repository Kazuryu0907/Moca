import * as dgram from "dgram";
import {WebSocketServer,WebSocket} from "ws";
import {BrowserWindow} from "electron";

export const socketComm = (mainWindow: BrowserWindow) => {

  const port = 12345;
  const host = "127.0.0.1";

  const socket = dgram.createSocket("udp4");

  socket.on("listening",() => {
      const addr = socket.address();
      console.log(`UDP socket listening on ${addr.address}:${addr.port}`);
  })

  const s = new WebSocketServer({port:8001});


  const Browsers = ["/icon","/playerName","/score","/team","/transition"] as const;
  type BrowserType = typeof Browsers[number];

  let clients: Record<BrowserType,WebSocket|null>= {
    "/icon":null,"/playerName":null,"/score":null,"/team":null,"/transition":null,
  };
  let connectedBrowsers:Record<BrowserType,boolean> = {
    "/icon":false,"/playerName":false,"/score":false,"/team":false,"/transition":false,
  };

  socket.on("message",(msg,remote) => {
      console.log(`${remote.address}:${remote.port} - ${msg}`);
      const data = msg.toString();
      console.log(data);
  });

  socket.bind(port, host);

  const isBrowser = (path:string): path is BrowserType => {
    return Browsers.some((v) => v === path);
  }

  //WebSocket
  s.on("connection",(ws,req) => {
    const path = req.url || "";
    if(isBrowser(path)){
      clients[path] = ws;
      connectedBrowsers[path] = true;
      mainWindow.webContents.send("connections",connectedBrowsers);
      console.log(connectedBrowsers);
    }

    ws.on("close",(s) => {
      if(isBrowser(path)){
        clients[path] = null;
        connectedBrowsers[path] = false;
        mainWindow.webContents.send("connections",connectedBrowsers);
      }
      // console.log(clients);
    });

    console.log(connectedBrowsers);
  });

}
