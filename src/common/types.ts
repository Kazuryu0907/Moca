export type auth_type = "credential" | "sheet_id" | "drive_id";

export type auth_process_connection_type = {
    auth_type:auth_type,
    text:string
}
