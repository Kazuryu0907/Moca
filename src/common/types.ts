export type auth_type = "credential" | "sheet_id" | "drive_id";

export type auth_process_connection_type = {
    auth_type:auth_type,
    text:string
}

export type socket_command_type = 
    "start" | "playerTable" | "boost" | "stats" | "player" | "score" | "subScore" |
    "time" | "goals" | "endStats" | "endReplay" | "end" | "matchId" | "teamNames";