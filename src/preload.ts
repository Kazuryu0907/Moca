import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("app", {
  on: (channel: string, callback: any) => ipcRenderer.on(channel, (event, argv) => callback(event, argv)),
  removeListener: (channel: string, listener: (...args: any[]) => void) =>
    ipcRenderer.removeListener(channel, listener),
  // async外したけど大丈夫かな
  index2render: (cmd: string, data?: any) => {
    if (data === undefined) {
      return ipcRenderer.invoke(cmd);
    } else {
      return ipcRenderer.invoke(cmd, data);
    }
  },
  render2index: async (cmd: string, data?: any) => {
    if (data) ipcRenderer.send(cmd, data);
    else ipcRenderer.send(cmd);
  },
  openBrowser: (url: string) => ipcRenderer.invoke("openBrowser", url),
  getHostIp: () => ipcRenderer.invoke("getHostIp"),
  setMatchingScore: (score: any) => ipcRenderer.invoke("setMatchingScore", score),
  setGameScore: (score: any) => ipcRenderer.invoke("setGameScore", score),
  connectedBrowsers: () => ipcRenderer.invoke("connectedBrowsers"),
  cachedMatchInfo: () => ipcRenderer.invoke("cachedMatchInfo"),
  getIdTable: () => ipcRenderer.invoke("getIdTable"),
  GOOGLEDRIVE_ID: () => ipcRenderer.invoke("GOOGLEDRIVE_ID"),
  loadTeams: () => ipcRenderer.invoke("spread:loadTeams"),
  getMatchInfo: () => ipcRenderer.invoke("spread:getMatchInfo"),
  sendSocket: (data: any) => ipcRenderer.invoke("sendSocket", data),
  sendSocketCommunication: (data: string) => ipcRenderer.invoke("sendSocketCommunication", data),
  stream: (data: any) => ipcRenderer.invoke("stream", data),
  getDrive: (id: string) => ipcRenderer.invoke("getDrive", id),
  glob: () => ipcRenderer.invoke("glob"),
  readFile: (path: string) => ipcRenderer.invoke("readFile", path),
  download: (data: string[]) => ipcRenderer.invoke("download", data),
  path_join: (...data: string[]) => ipcRenderer.invoke("path.join", data),
  encodeString: (data: string) => ipcRenderer.invoke("iconv", data),
  removeFile: (data: string) => ipcRenderer.invoke("removeFile", data),
  graphicsDir: () => ipcRenderer.invoke("graphics_dir"),
  mkdir: (path: string) => ipcRenderer.invoke("mkdir", path),

  // 認証関連の新しいIPC
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
});
