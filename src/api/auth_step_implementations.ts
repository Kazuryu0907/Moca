import { existsSync, readFileSync } from "fs";
import { AuthStep, AuthStepResult } from "./auth_steps";
import { SheetService, sheet_credential_type } from "./spread";
import { DriveService, drive_credential_type } from "./gdrive";
import { handle_error2, handle_error_async2 } from "../common/handle_error";
import { getErrorMessage } from "../common/error_messages";
import { ConfigManager } from "../common/config";

export class CredentialAuthStep extends AuthStep {
  readonly stepName = "Credential Authentication";
  readonly description = "Google API認証情報の検証";
  
  constructor(
    private sheetService: SheetService,
    private driveService: DriveService,
    private configManager: ConfigManager
  ) {
    super();
  }
  
  async execute(): Promise<AuthStepResult> {
    // 設定からクレデンシャル取得
    const config = this.configManager.getCurrentConfig();
    if (!config) {
      return this.createErrorResult('CREDENTIAL_PARSE_ERROR', 'Configuration not loaded');
    }
    
    // Sheet認証
    const [, sheetError] = await this.authSheet(config.credentials);
    if (sheetError) {
      if (sheetError.includes('parse error')) {
        return this.createErrorResult('CREDENTIAL_PARSE_ERROR');
      } else if (sheetError.includes('key is not found')) {
        return this.createErrorResult('CREDENTIAL_MISSING_KEYS');
      } else {
        return this.createErrorResult('SHEET_AUTH_FAILED', sheetError);
      }
    }
    
    // Drive認証 - 一時的にファイル経由（後で改善予定）
    const [, driveError] = await this.authDrive();
    if (driveError) {
      return this.createErrorResult('DRIVE_AUTH_FAILED', driveError);
    }
    
    return this.createSuccessResult();
  }
  
  private async authSheet(credentials: {client_email: string, private_key: string}): Promise<[void, string | undefined]> {
    if (!credentials.client_email || !credentials.private_key) {
      return [undefined, getErrorMessage('CREDENTIAL_MISSING_KEYS').developer];
    }
    
    const credential: sheet_credential_type = {
      client_email: credentials.client_email,
      private_key: credentials.private_key
    };
    
    const [, authErr] = await handle_error_async2(this.sheetService.auth(credential));
    if (authErr) return [undefined, authErr.error_message];
    
    return [undefined, undefined];
  }
  
  private async authDrive(): Promise<[void, string | undefined]> {
    // 一時的にファイルパスベースの認証を使用
    const configPath = this.configManager.fullConfigPath;
    const credential: drive_credential_type = {
      credential_full_path: configPath
    };
    
    const [, authErr] = await handle_error2(() => this.driveService.auth(credential));
    if (authErr) return [undefined, authErr.error_message];
    
    return [undefined, undefined];
  }
}

export class SheetConfigStep extends AuthStep {
  readonly stepName = "Sheet Configuration";
  readonly description = "スプレッドシート設定の検証";
  
  constructor(
    private sheetService: SheetService,
    private sheetId: string
  ) {
    super();
  }
  
  async execute(): Promise<AuthStepResult> {
    const [, error] = await handle_error_async2(this.sheetService.setSheetID(this.sheetId));
    if (error) {
      return this.createErrorResult('INVALID_SHEET_ID', error.error_message);
    }
    
    // 初期データ読み込み
    try {
      await this.sheetService.getMatchInfo();
      await this.sheetService.loadTeams();
      await this.sheetService.getIds();
    } catch (error) {
      return this.createErrorResult('SHEET_STRUCTURE_ERROR', (error as Error).message);
    }
    
    return this.createSuccessResult();
  }
}

export class DriveConfigStep extends AuthStep {
  readonly stepName = "Drive Configuration";  
  readonly description = "Google Drive設定の検証";
  
  constructor(
    private driveService: DriveService,
    private driveId: string
  ) {
    super();
  }
  
  async execute(): Promise<AuthStepResult> {
    const [, error] = await handle_error_async2(this.driveService.clientCheck(this.driveId));
    if (error) {
      return this.createErrorResult('INVALID_DRIVE_ID', error.error_message);
    }
    
    return this.createSuccessResult();
  }
}

export class DirectoryConfigStep extends AuthStep {
  readonly stepName = "Directory Configuration";
  readonly description = "ローカル保存ディレクトリの確認";
  
  constructor(private downloadDirectory: string) {
    super();
  }
  
  async execute(): Promise<AuthStepResult> {
    if (!existsSync(this.downloadDirectory)) {
      return this.createErrorResult('DIRECTORY_NOT_FOUND');
    }
    
    return this.createSuccessResult();
  }
}