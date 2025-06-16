import { SheetService,sheet_credential_type } from "./spread"
import { DriveService,drive_credential_type } from "./gdrive"

import { ipcMain, dialog } from "electron";
import { AuthErrorType, formatUserError, getErrorMessage } from "../common/error_messages";
import { ConfigManager, AppConfig } from "../common/config";


import { BrowserWindow } from "electron";
import {auth_process_connection_type} from "@/common/types";
import { AuthFlowManager } from "./auth_steps";
import { 
  CredentialAuthStep, 
  SheetConfigStep, 
  DriveConfigStep, 
  DirectoryConfigStep 
} from "./auth_step_implementations";
export class New_start{
    sheet_service:SheetService;
    drive_service:DriveService;
    mainwindow:BrowserWindow;
    private download_directory:string = "";
    private _drive_id:string = "";
    private configManager: ConfigManager;
    
    constructor(sheet_service:SheetService,drive_service:DriveService,mainwindow:BrowserWindow){
        this.sheet_service = sheet_service;
        this.drive_service = drive_service;
        this.mainwindow = mainwindow;
        this.configManager = ConfigManager.getInstance();
        
        ipcMain.on("start:send_to_main",async(_event,value:auth_process_connection_type) => {
            console.log(value);
            
            try {
                if(value.auth_type === "credential"){
                    const credentialData = JSON.parse(value.text);
                    await this.configManager.updateCredentials({
                        client_email: credentialData.client_email,
                        private_key: credentialData.private_key
                    });
                }
                
                if(value.auth_type === "sheet_id"){
                    await this.configManager.updateServices({ sheet_id: value.text });
                }
                
                if(value.auth_type === "drive_id"){
                    await this.configManager.updateServices({ drive_id: value.text });
                }
                
                // 再帰的に呼び出す
                this.authorization();
            } catch (error) {
                console.error("Configuration update error:", error);
                this.send_error_to_main('CREDENTIAL_PARSE_ERROR', (error as Error).message);
            }
        });
    }

    private send_to_main(data:auth_process_connection_type["auth_type"],message:string){
        const send_data:auth_process_connection_type = {
            auth_type:data,
            text:message
        }
        this.mainwindow.webContents.send("start:send_from_main",send_data);
    }

    private send_error_to_main(errorType: AuthErrorType, context?: string) {
        const userMessage = formatUserError(errorType, context);
        const errorMessage = getErrorMessage(errorType);
        
        // 開発者向けログ
        console.error(`[${errorType}] ${errorMessage.developer}${context ? ` - ${context}` : ''}`);
        
        // エラーレベルに応じた処理
        if (errorType === 'CREDENTIAL_PARSE_ERROR' || errorType === 'CREDENTIAL_MISSING_KEYS') {
            this.send_to_main("credential", userMessage);
        } else if (errorType === 'INVALID_SHEET_ID' || errorType === 'SHEET_STRUCTURE_ERROR') {
            this.send_to_main("sheet_id", userMessage);
        } else if (errorType === 'INVALID_DRIVE_ID') {
            this.send_to_main("drive_id", userMessage);
        } else if (errorType === 'DIRECTORY_NOT_FOUND') {
            this.send_to_main("download_directory", userMessage);
        }
    }
    async authorization(){
        try {
            // 既存設定ファイルからの移行を試行
            await this.configManager.migrateFromLegacyFiles();
            
            // 設定読み込み
            let config: AppConfig;
            try {
                config = await this.configManager.loadConfig();
            } catch (error) {
                console.error("Config load error:", error);
                this.send_error_to_main('CREDENTIAL_PARSE_ERROR', (error as Error).message);
                return;
            }
            
            // 認証フローステップを作成
            const steps = [
                new CredentialAuthStep(this.sheet_service, this.drive_service, this.configManager),
                new SheetConfigStep(this.sheet_service, config.services.sheet_id),
                new DriveConfigStep(this.drive_service, config.services.drive_id),
                new DirectoryConfigStep(config.services.download_directory)
            ];
            
            const authFlow = new AuthFlowManager(steps);
            const result = await authFlow.executeFlow();
            
            if (!result.success && result.errorType) {
                // ディレクトリが見つからない場合は特別処理
                if (result.errorType === 'DIRECTORY_NOT_FOUND') {
                    this.send_error_to_main('DIRECTORY_NOT_FOUND');
                    const res = await dialog.showOpenDialog(this.mainwindow, {
                        properties: ["openDirectory"],
                        title: "Download directoryを選択してください"
                    });
                    
                    if (res.canceled) {
                        this.authorization(); // 再帰呼び出し
                        return;
                    }
                    
                    // ディレクトリ更新
                    await this.configManager.updateServices({ 
                        download_directory: res.filePaths[0] 
                    });
                    
                    // 再実行
                    this.authorization();
                    return;
                }
                
                // その他のエラー
                this.send_error_to_main(result.errorType, result.errorContext);
                return;
            }
            
            // 成功時の処理
            const currentConfig = this.configManager.getCurrentConfig()!;
            this._drive_id = currentConfig.services.drive_id;
            this.download_directory = currentConfig.services.download_directory;
            
            // UI初期化用データ送信
            const match_info = await this.sheet_service.getMatchInfo();
            const id_table = await this.sheet_service.getIds();
            this.mainwindow.webContents.send("cachedMatchInfo", match_info);
            this.mainwindow.webContents.send("cachedIdTable", id_table);
            
            console.log("Authorization completed successfully");
            this.send_to_main("success", "🎉 認証が完了しました！");
            
        } catch (error) {
            console.error("Authorization error:", error);
            this.send_error_to_main('CREDENTIAL_PARSE_ERROR', (error as Error).message);
        }
    }

    get drive_id(){
        return this._drive_id;
    }
    get download_directory_path(){
        return this.download_directory;
    }
}