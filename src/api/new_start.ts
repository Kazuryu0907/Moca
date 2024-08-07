import { SheetService,sheet_credential_type } from "./spread"
import { DriveService,drive_credential_type } from "./gdrive"

import {existsSync,readFileSync,writeFileSync} from "fs"
import {join} from "path";
import { ipcMain, dialog } from "electron";
import {ErrorHandleType,return_error,handle_error_async2,handle_error2} from "../common/handle_error";

const env_base_path = "./env";
const credential_path = "./credential.json";
const service_id_path = "./config.json";

const full_credential_path = join(process.cwd(),env_base_path,credential_path);
const full_service_id_path = join(process.cwd(),env_base_path,service_id_path);

interface ServiceIDConfig {
    sheet_id:string;
    drive_id:string;
    download_directory:string;
}


import { BrowserWindow } from "electron";
import {auth_process_connection_type} from "@/common/types"
export class New_start{
    sheet_service:SheetService;
    drive_service:DriveService;
    mainwindow:BrowserWindow;
    private download_directory:string;
    constructor(sheet_service:SheetService,drive_service:DriveService,mainwindow:BrowserWindow){
        this.sheet_service = sheet_service;
        this.drive_service = drive_service;
        this.mainwindow = mainwindow; 
        this.download_directory = "";
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
            writeFileSync(full_service_id_path,JSON.stringify({sheet_id:"",drive_id:"",download_directory:""}));
        }
        const data = readFileSync(full_service_id_path).toString();
        const json = JSON.parse(data);
        const service_id_config:ServiceIDConfig = {sheet_id:json.sheet_id,drive_id:json.drive_id,download_directory:json.download_directory};
        return service_id_config;
    }

    private is_exist_download_directory(download_directory:string):boolean{
        return existsSync(download_directory);
    }
    private async load_sheet(sheet_id:string):Promise<ErrorHandleType<void>>{
        const[config,err] = await handle_error_async2(this.sheet_service.setSheetID(sheet_id));
        if(err)return return_error(err.error_message);

        // Sheetタブの初期化用
        const match_info = await this.sheet_service.getMatchInfo();
        await this.sheet_service.loadTeams();
        const id_table = await this.sheet_service.getIds();
        this.mainwindow.webContents.send("cachedMatchInfo",match_info);
        this.mainwindow.webContents.send("cachedIdTable",id_table);

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
    private send_to_main(data:auth_process_connection_type["auth_type"],message:string){
        const send_data:auth_process_connection_type = {
            auth_type:data,
            text:message
        }
        this.mainwindow.webContents.send("start:send_from_main",send_data);
    }
    async authorization(){
        const [,err_sheet] = await this.auth_sheet_from_exist_file(full_credential_path);
        const [,err_drive] = await this.auth_drive_from_exist_file(full_credential_path);
        if(err_sheet){
            console.log(err_sheet.error_message);
            this.send_to_main("credential","sheet authorization error");
            return;
        }
        if(err_drive){
            console.log(err_drive.error_message);
            this.send_to_main("credential","drive authorization error");
            return;
        }

        const service_id_config = this.read_service_id_config(full_service_id_path);
        const [,error_sheet_id] = await this.load_sheet(service_id_config.sheet_id);
        if(error_sheet_id){
            console.log("sheet_id_load_error");
            this.send_to_main("sheet_id","sheet id load error");
            return;
        }

        const [,error_drive_id] = await this.load_drive(service_id_config.drive_id);
        if(error_drive_id){
            console.log(error_drive_id.error_message);
            this.send_to_main("drive_id","drive id load error");
            return;
        }

        const is_exits_download_directory = this.is_exist_download_directory(service_id_config.download_directory);
        if(!is_exits_download_directory){
            console.log("download directory not found");
            this.send_to_main("download_directory","Download directoryを入力してください");
            const res = await dialog.showOpenDialog(this.mainwindow,{properties:["openDirectory"],title:"Download directoryを選択してください"});
            // cancelされたら再帰
            if(res.canceled)this.authorization();
            // download_directory更新
            service_id_config.download_directory = res.filePaths[0];
            console.log(service_id_config);
            writeFileSync(full_service_id_path,JSON.stringify(service_id_config));
        }

        // mainで使う用に保存
        this.download_directory = service_id_config.download_directory;

        console.log("Success");
        this.send_to_main("success","Welcome back!");
        // send_to_main("Success");

    }

    get download_directory_path(){
        return this.download_directory;
    }
}