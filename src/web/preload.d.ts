declare global {
    interface Window {
        app: IMainProcess;
    }
}
declare module "*.json"
import {dataType} from "./components/types";

export interface IMainProcess {
    on: (channel:string,callback:any) => void;
    index2render:(cmd:string,data?:any) => any;
    render2index:(cmd:string,data?:any) => any;
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
    spreadAuth: () => Promise<void>,
    spreadHasPrivateKey: () => Promise<void>,
    graphicsDir: () => Promise<string>,
    mkdir: (path:string) => Promise<void>;

} 
