import { WebSocket } from "ws";
export type auth_type = "credential" | "sheet_id" | "drive_id" | "download_directory" | "success";

export type auth_process_connection_type = {
  auth_type: auth_type;
  text: string;
};

export type socket_command_type =
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
export type ws_onConnection_type = (ws: WebSocket, path: BrowserType) => void;
export type ws_cmd_type = { cmd: socket_command_type; data: any };
export type ws_cmd_func_type = (input: ws_cmd_type) => void;
export type ws_add_cmd_listener_type = ((input: ws_cmd_type) => void) | ((input: ws_cmd_type) => void)[];

/* eslint-enable no-unused-vars*/
