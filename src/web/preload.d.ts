declare global {
    interface Window {
        app: IMainProcess;
    }
}
declare module "*.json"
import {dataType,spreadMatchInfoType,BrowserType} from "./components/types";
export interface IMainProcess {
    on: (channel:string,callback:any) => void;
    index2render:(cmd:string,data?:any) => any;
    render2index:(cmd:string,data?:any) => any;
    getTeamInfo:() => Promise<any>;
    getIdTable:() => Promise<Record<string,string>>;
    connectedBrowsers: () => Promise<Record<string,boolean> >;
    GOOGLEDRIVE_ID:() => Promise<string|null>;
    SPREADSHEET_ID:() => Promise<string|null>;
    stream:(data:any) => Promise<void>,
    cachedMatchInfo: () => Promise<spreadMatchInfoType>,
    loadTeams: () => Promise<void>;
    getMatchInfo: () => Promise<spreadMatchInfoType>;
    sendSocketCommunication:(data:string) => Promise<void>;
    sendSocket:(data:{path:string,data:dataType}) => Promise<void>;
    getDrive:(id:string) => Promise<any>;
    getTeam:() => Promise<any>;
    glob: () => Promise<any>;
    download: (data:string[]) => Promise<any>;
    // invokeはArrayしか受け取れないっぽい
    path_join: (...data:string[]) => Promise<any>;
    encodeString: (data:string) => Promise<string>;
    removeFile: (data:string) => Promise<void>,
    setSheetID: (data:string) => Promise<void>,
    spreadAuth: () => Promise<boolean>,
    spreadHasPrivateKey: () => Promise<void>,
    driveAuth: (id:string) => Promise<boolean>,
    graphicsDir: () => Promise<string>,
    mkdir: (path:string) => Promise<void>;

} 
