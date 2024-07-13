import { SheetService,sheet_credential_type } from "./spread"
import { DriveService,drive_credential_type } from "./gdrive"

import {existsSync,readFileSync,writeFileSync} from "fs"
import {join} from "path";
import { ipcMain } from "electron";
import {ErrorHandleType,return_error,handle_error_async2,handle_error2} from "../common/handle_error";

const env_base_path = "./env";
const credential_path = "./credential.json";
const service_id_path = "./config.json";

const full_credential_path = join(process.cwd(),env_base_path,credential_path);
const full_service_id_path = join(process.cwd(),env_base_path,service_id_path);

interface ServiceIDConfig {
    sheet_id:string;
    drive_id:string;
}


import { BrowserWindow } from "electron";
import {auth_process_connection_type} from "@/common/types"
export class New_start{
    sheet_service:SheetService;
    drive_service:DriveService;
    mainwindow:BrowserWindow;
    constructor(sheet_service:SheetService,drive_service:DriveService,mainwindow:BrowserWindow){
        this.sheet_service = sheet_service;
        this.drive_service = drive_service;
        this.mainwindow = mainwindow; 
        ipcMain.on("start:send_to_main",async(_event,value:auth_process_connection_type) => {
            console.log(value);
            if(value.auth_type === "credential"){
                const full_path = full_credential_path;
                writeFileSync(full_path,value.text);
            }
            if(value.auth_type === "sheet_id" || value.auth_type === "drive_id"){
                const id = value.text;
                const config = this.read_service_id_config(full_service_id_path);
                console.log(config);
                config[value.auth_type] = id;
                writeFileSync(full_service_id_path,JSON.stringify(config));
            }
            // 再帰的に呼び出す
            this.authorization();
        });
    }

    private read_sheet_credential(full_sheet_credential_path:string):ErrorHandleType<sheet_credential_type>{
        // TODO parseとkeyのエラーハンドリング
        // ファイルなかったら作る
        if(!existsSync(full_sheet_credential_path))writeFileSync(full_sheet_credential_path,JSON.stringify({client_email:"",private_key:""}));
        const data = readFileSync(full_sheet_credential_path).toString(); 
        const [json,err] = handle_error2(() => JSON.parse(data));
        // parse error
        if(err)return return_error("parse error");
        // console.log(json);
        if(!json?.client_email|| !json?.private_key)return return_error("key is not found");
        const sheet_credential:sheet_credential_type = {client_email:json.client_email,private_key:json.private_key};
        return [sheet_credential,undefined]
    }

    // 対称性を持たせるためだけのmethod
    private read_drive_credential(full_drive_credential_path:string):drive_credential_type{
        return {
            credential_full_path:full_drive_credential_path
        };
    }

    private read_service_id_config(full_service_id_path:string):ServiceIDConfig{
        if(!existsSync(full_service_id_path)){
            writeFileSync(full_service_id_path,JSON.stringify({sheet_id:"",drive_id:""}));
        }
        const data = readFileSync(full_service_id_path).toString();
        const json = JSON.parse(data);
        const service_id_config:ServiceIDConfig = {sheet_id:json.sheet_id,drive_id:json.drive_id};
        return service_id_config;
    }

    private async load_sheet(sheet_id:string):Promise<ErrorHandleType<void>>{
        const[config,err] = await handle_error_async2(this.sheet_service.setSheetID(sheet_id));
        if(err)return return_error(err.error_message);
        return [config,undefined];
    }

    private async load_drive(drive_id:string):Promise<ErrorHandleType<boolean>>{
        const [config,err] = await handle_error_async2(this.drive_service.clientCheck(drive_id));
        if(err)return return_error(err.error_message);
        return [config,undefined];
    }


    private async auth_sheet_from_exist_file(full_path:string):Promise<ErrorHandleType<void>>{
        console.time("read_sheet_credential")
        const [sheet_credential,err] = this.read_sheet_credential(full_path);
        console.timeEnd("read_sheet_credential")
        if(err)return return_error(err.error_message);
        console.time("_auth_sheet")
        const [res_auth,err2] = await handle_error_async2(this.sheet_service.auth(sheet_credential));
        console.timeEnd("_auth_sheet")
        if(err2)return return_error(err2.error_message);
        // console.log(res);
        return [res_auth,undefined];
    }
    private async auth_drive_from_exist_file(full_path:string):Promise<ErrorHandleType<void>>{
        const drive_credential = this.read_drive_credential(full_path);
        const [res_auth,err] = await handle_error2(() => this.drive_service.auth(drive_credential));
        if(err)return return_error(err.error_message);
        // console.log(res);
        return [res_auth,undefined];
    }
    async authorization(){
        const send_to_main = (data:auth_process_connection_type["auth_type"]) => {
            this.mainwindow.webContents.send("start:send_from_main",data);
            return;
        }

        console.time("auth_sheet")
        const [,err_sheet] = await this.auth_sheet_from_exist_file(full_credential_path);
        console.timeEnd("auth_sheet")
        console.time("auth_drive")
        const [,err_drive] = await this.auth_drive_from_exist_file(full_credential_path);
        console.timeEnd("auth_drive")
        if(err_sheet){
            console.log(err_sheet.error_message);
            send_to_main("credential");
            return;
        }
        if(err_drive){
            console.log(err_drive.error_message);
            send_to_main("credential");
            return;
        }

        const service_id_config = this.read_service_id_config(full_service_id_path);
        const [,error_sheet_id] = await this.load_sheet(service_id_config.sheet_id);
        if(error_sheet_id){
            console.log("sheet_id_load_error");
            send_to_main("sheet_id");
            return;
        }

        const [,error_drive_id] = await this.load_drive(service_id_config.drive_id);
        if(error_drive_id){
            console.log(error_drive_id.error_message);
            send_to_main("drive_id");
            return;
        }

        console.log("Success");
        send_to_main("success");
        // send_to_main("Success");

    }
}