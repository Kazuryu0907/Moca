import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('app', {
  on: (channel: string, callback: any) =>
    ipcRenderer.on(channel, (event, argv) => callback(event, argv)),
  //async外したけど大丈夫かな
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
  setMatchingScore: (score:any) => ipcRenderer.invoke('setMatchingScore',score),
  setGameScore: (score:any) => ipcRenderer.invoke('setGameScore',score),
  connectedBrowsers: () => ipcRenderer.invoke('connectedBrowsers'),
  cachedMatchInfo: () => ipcRenderer.invoke('cachedMatchInfo'),
  getIdTable: () => ipcRenderer.invoke('getIdTable'),
  GOOGLEDRIVE_ID: () => ipcRenderer.invoke('GOOGLEDRIVE_ID'),
  SPREADSHEET_ID: () => ipcRenderer.invoke('SPREADSHEET_ID'),
  loadTeams: () => ipcRenderer.invoke('spread:loadTeams'),
  getMatchInfo: () => ipcRenderer.invoke('spread:getMatchInfo'),
  sendSocket: (data: any) => ipcRenderer.invoke('sendSocket', data),
  sendSocketCommunication: (data: string) =>
    ipcRenderer.invoke('sendSocketCommunication', data),
  stream: (data: any) => ipcRenderer.invoke('stream', data),
  getDrive: (id: string) => ipcRenderer.invoke('getDrive', id),
  // getTeam: () => ipcRenderer.invoke("getTeam"),
  glob: () => ipcRenderer.invoke('glob'),
  readFile: (path: string) => ipcRenderer.invoke('readFile', path),
  download: (data: string[]) => ipcRenderer.invoke('download', data),
  path_join: (...data: string[]) => ipcRenderer.invoke('path.join', data),
  encodeString: (data: string) => ipcRenderer.invoke('iconv', data),
  removeFile: (data: string) => ipcRenderer.invoke('removeFile', data),
  setSheetID: (data: string) => ipcRenderer.invoke('spread:setSheetID', data),
  spreadAuth: () => ipcRenderer.invoke('spread:auth'),
  spreadHasPrivateKey: () => ipcRenderer.invoke('spread:hasPrivateKey'),
  driveAuth: (folderID: string) => ipcRenderer.invoke('gdrive:auth', folderID),
  graphicsDir: () => ipcRenderer.invoke('graphics_dir'),
  mkdir: (path: string) => ipcRenderer.invoke('mkdir', path)
});
