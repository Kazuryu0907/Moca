declare global {
  interface Window {
    app: IMainProcess;
  }
}
declare module "*.json";
import { dataType, spreadMatchInfoType } from "./components/types";
export interface IMainProcess {
  on: (channel: string, callback: any) => void;
  removeListener: (channel: string, listener: (...args: any[]) => void) => void;
  index2render: (cmd: string, data?: any) => any;
  render2index: (cmd: string, data?: any) => any;
  openBrowser: (url: string) => Promise<void>;
  getHostIp: () => Promise<string>;
  setMatchingScore: (score: { blue: number; orange: number }) => Promise<void>;
  setGameScore: (score: { blue: number; orange: number }) => Promise<void>;
  getTeamInfo: () => Promise<any>;
  getIdTable: () => Promise<Record<string, string>>;
  connectedBrowsers: () => Promise<Record<string, boolean>>;
  GOOGLEDRIVE_ID: () => Promise<string | null>;
  SPREADSHEET_ID: () => Promise<string | null>;
  stream: (data: any) => Promise<void>;
  cachedMatchInfo: () => Promise<spreadMatchInfoType>;
  loadTeams: () => Promise<void>;
  getMatchInfo: () => Promise<spreadMatchInfoType>;
  sendSocketCommunication: (data: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  sendSocket: (data: { path: string; data: dataType }) => Promise<void>;
  getDrive: (id: string) => Promise<any>;
  glob: () => Promise<any>;
  download: (data: string[]) => Promise<any>;
  // invokeはArrayしか受け取れないっぽい
  path_join: (...data: string[]) => Promise<any>;
  encodeString: (data: string) => Promise<string>;
  removeFile: (data: string) => Promise<void>;
  setSheetID: (data: string) => Promise<void>;
  spreadAuth: () => Promise<boolean>;
  spreadHasPrivateKey: () => Promise<void>;
  driveAuth: (id: string) => Promise<boolean>;
  graphicsDir: () => Promise<string>;
  mkdir: (path: string) => Promise<void>;
  send_to_main: (value: any) => Promise<void>;
}
