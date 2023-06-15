declare global {
    interface Window {
        app: IMainProcess;
    }
}
declare module "*.json"

export interface IMainProcess {
    on: (channel:string,callback:any) => void;
    index2render:(cmd:string,data?:any) => any;
    render2index:(cmd:string,data?:any) => any;
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

} 
