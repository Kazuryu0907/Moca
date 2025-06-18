import { WebSocket } from "ws";
export type AuthStatusMessageType = "progress" | "error" | "success" | "warning";

export interface AuthStatusMessage {
  type: AuthStatusMessageType;
  step: string;
  message: string;
  details?: string[];
}

export type SocketCommandType =
  | "start"
  | "playerTable"
  | "boost"
  | "stats"
  | "player"
  | "score"
  | "subScore"
  | "time"
  | "goals"
  | "endStats"
  | "endReplay"
  | "end"
  | "matchId"
  | "teamNames";

export const Browsers = [
  "/icon",
  "/playerName",
  "/score",
  "/nextMatch",
  "/transition",
  "/boost",
  "/stats",
] as const;

export type BrowserType = (typeof Browsers)[number];

/* eslint-disable no-unused-vars*/
export type WsOnConnectionType = (ws: WebSocket, path: BrowserType) => void;
export type WsCmdType = { cmd: SocketCommandType; data: any };
export type WsCmdFuncType = (input: WsCmdType) => void;
export type WsAddCmdListenerType = ((input: WsCmdType) => void) | ((input: WsCmdType) => void)[];

/* eslint-enable no-unused-vars*/
