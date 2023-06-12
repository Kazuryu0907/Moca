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
        getDrive: (id:string) => ipcRenderer.invoke("getDrive",id),
        getTeam: () => ipcRenderer.invoke("getTeam"),
        glob: () => ipcRenderer.invoke("glob"),
        download: (data:string[]) => ipcRenderer.invoke("download",data),
        path_join: (...data:string[]) => ipcRenderer.invoke("path.join",data),
        encodeString: (data:string) => ipcRenderer.invoke("iconv",data),
        removeFile: (data:string) => ipcRenderer.invoke("removeFile",data),
    }
);
