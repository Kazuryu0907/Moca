declare global {
    interface Window {
        app: IMainProcess;
    }
}

export interface IMainProcess {
    on: (channel:string,callback:any) => void;
    index2render:(cmd:string,data?:any) => any;
    render2index:(cmd:string,data?:any) => any;
    getDrive:(id:string) => Promise<any>;
    getTeam:() => Promise<any>;
} 
