import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

contextBridge.exposeInMainWorld(
    "app", {
        on: (channel:string,callback:any) => ipcRenderer.on(channel,(event,argv) => callback(event,argv)),
        //async外したけど大丈夫かな
        index2render: (cmd:string,data?:any) => {
            if(data === undefined){
                return ipcRenderer.invoke(cmd);
            }else{
                return ipcRenderer.invoke(cmd,data);
            }
        },
        render2index:async (cmd:string,data?:any) => {
            if(data)ipcRenderer.send(cmd,data);
            else ipcRenderer.send(cmd);
        },
        getDrive: () => ipcRenderer.invoke("getDrive"),
        getTeam: () => ipcRenderer.invoke("getTeam")
    }
);
