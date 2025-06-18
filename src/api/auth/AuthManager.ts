import { BrowserWindow } from "electron";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import { join } from "path";
import { ZodError } from "zod";
import { ErrorHandleType, handle_error_async2, return_error } from "../../common/handle_error";
import { AuthStatusMessage, AuthStatusMessageType } from "../../common/types";
import { drive_credential_type, DriveService } from "../gdrive";
import { sheet_credential_type, SheetService } from "../spread";
import {
  AuthConfig,
  AuthConfigSchema,
  AuthConfigTemplate,
  CONFIG_COMMENTS,
  Credentials,
  CREDENTIALS_COMMENTS,
  CredentialsSchema,
  CredentialsTemplate,
} from "./AuthConfig";

export interface AuthResult {
  success: boolean;
  errors: string[];
  config: AuthConfig | null;
}

export class AuthManager {
  private configPath: string;
  private credentialsPath: string;
  private sheetService: SheetService;
  private driveService: DriveService;
  private config: AuthConfig | null = null;
  private credentials: Credentials | null = null;
  private browserWindow: BrowserWindow;

  constructor(sheetService: SheetService, driveService: DriveService, browserWindow: BrowserWindow) {
    this.configPath = join(process.cwd(), "./env/auth_config.json");
    this.credentialsPath = join(process.cwd(), "./env/credential.json");
    this.sheetService = sheetService;
    this.driveService = driveService;
    this.browserWindow = browserWindow;
  }

  private sendStatusMessage(type: AuthStatusMessageType, step: string, message: string, details?: string[]): void {
    const statusMessage: AuthStatusMessage = {
      type,
      step,
      message,
      details,
    };

    this.browserWindow.webContents.send("auth:status", statusMessage);

    // コンソールにも出力（デバッグ用）
    const emoji = type === "error" ? "❌" : type === "success" ? "✅" : type === "warning" ? "⚠️" : "🔄";
    console.log(`${emoji} [${step}] ${message}`);
    if (details && details.length > 0) {
      details.forEach(detail => console.log(`  - ${detail}`));
    }
  }

  async authenticate(): Promise<AuthResult> {
    this.sendStatusMessage("progress", "start", "認証プロセスを開始します...");
    const errors: string[] = [];

    try {
      // 1. 認証情報読み込み
      this.sendStatusMessage("progress", "credentials", "認証情報を読み込んでいます...");
      const [credentials, credentialsError] = await this.loadAndValidateCredentials();
      if (credentialsError) {
        this.sendStatusMessage("error", "credentials", "認証情報の読み込みに失敗しました", [
          credentialsError.error_message,
        ]);
        return { success: false, errors: [credentialsError.error_message], config: null };
      }

      this.credentials = credentials;
      this.sendStatusMessage("success", "credentials", "認証情報の読み込み・検証が完了しました");

      // 2. 設定ファイル読み込み
      this.sendStatusMessage("progress", "config", "アプリケーション設定を読み込んでいます...");
      const [config, configError] = await this.loadAndValidateConfig();
      if (configError) {
        this.sendStatusMessage("error", "config", "設定ファイルの読み込みに失敗しました", [configError.error_message]);
        return { success: false, errors: [configError.error_message], config: null };
      }

      this.config = config;
      this.sendStatusMessage("success", "config", "アプリケーション設定の読み込み・検証が完了しました");

      // 3. Google Sheets認証
      this.sendStatusMessage("progress", "sheets", "Google Sheetsに接続しています...");
      const [, sheetError] = await this.authenticateSheets(credentials);
      if (sheetError) {
        const errorMsg = `Google Sheets認証失敗: ${sheetError.error_message}`;
        errors.push(errorMsg);
        this.sendStatusMessage("error", "sheets", "Google Sheets認証に失敗しました", [sheetError.error_message]);
      } else {
        this.sendStatusMessage("success", "sheets", "Google Sheets認証が完了しました");
      }

      // 4. Google Drive認証
      this.sendStatusMessage("progress", "drive", "Google Driveに接続しています...");
      const [, driveError] = await this.authenticateDrive();
      if (driveError) {
        const errorMsg = `Google Drive認証失敗: ${driveError.error_message}`;
        errors.push(errorMsg);
        this.sendStatusMessage("error", "drive", "Google Drive認証に失敗しました", [driveError.error_message]);
      } else {
        this.sendStatusMessage("success", "drive", "Google Drive認証が完了しました");
      }

      // 5. サービステスト
      if (errors.length === 0) {
        this.sendStatusMessage("progress", "services", "サービス接続をテストしています...");
        const serviceErrors = await this.testServices(config.services);
        errors.push(...serviceErrors);
      }

      // 6. ダウンロードディレクトリ確認
      this.sendStatusMessage("progress", "directory", "ダウンロードディレクトリを確認しています...");
      if (!existsSync(config.services.download_directory)) {
        const error = `ダウンロードディレクトリが存在しません: ${config.services.download_directory}`;
        errors.push(error);
        this.sendStatusMessage("error", "directory", "ダウンロードディレクトリが見つかりません", [error]);
      } else {
        this.sendStatusMessage("success", "directory", "ダウンロードディレクトリの確認が完了しました");
      }

      // 最終結果
      const success = errors.length === 0;
      if (success) {
        this.sendStatusMessage("success", "complete", "認証プロセスが正常に完了しました");
      } else {
        this.sendStatusMessage("error", "complete", "認証プロセスでエラーが発生しました", errors);
      }

      return { success, errors, config };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      this.sendStatusMessage("error", "fatal", "認証プロセス中に予期しないエラーが発生しました", [errorMessage]);
      return { success: false, errors: [errorMessage], config: null };
    }
  }

  private async loadAndValidateCredentials(): Promise<ErrorHandleType<Credentials>> {
    try {
      if (!existsSync(this.credentialsPath)) {
        console.log("📝 認証情報ファイルが見つかりません。テンプレートを作成します...");
        await this.createCredentialsTemplate();
        return return_error("認証情報ファイルを作成しました。Google Service Accountの認証情報を設定してください。");
      }

      const data = await fs.readFile(this.credentialsPath, "utf-8");

      let jsonData: unknown;
      try {
        jsonData = JSON.parse(data);
      } catch {
        return return_error("認証情報ファイルのJSON形式が正しくありません");
      }

      const validationResult = CredentialsSchema.safeParse(jsonData);
      if (!validationResult.success) {
        const errorMessages = this.formatZodErrors(validationResult.error);
        console.error("❌ 認証情報ファイルの検証エラー:");
        errorMessages.forEach(msg => console.error("  -", msg));
        return return_error(`認証情報ファイルの検証に失敗しました:\n${errorMessages.join("\n")}`);
      }

      return [validationResult.data, undefined];
    } catch (error) {
      return return_error(`認証情報ファイルの読み込みに失敗しました: ${error}`);
    }
  }

  private async loadAndValidateConfig(): Promise<ErrorHandleType<AuthConfig>> {
    try {
      if (!existsSync(this.configPath)) {
        console.log("📝 設定ファイルが見つかりません。テンプレートを作成します...");
        await this.createConfigTemplate();
        return return_error("設定ファイルを作成しました。認証情報とサービスIDを設定してください。");
      }

      const data = await fs.readFile(this.configPath, "utf-8");

      let jsonData: unknown;
      try {
        jsonData = JSON.parse(data);
      } catch {
        return return_error("設定ファイルのJSON形式が正しくありません");
      }

      const validationResult = AuthConfigSchema.safeParse(jsonData);
      if (!validationResult.success) {
        const errorMessages = this.formatZodErrors(validationResult.error);
        console.error("❌ 設定ファイルの検証エラー:");
        errorMessages.forEach(msg => console.error("  -", msg));
        return return_error(`設定ファイルの検証に失敗しました:\n${errorMessages.join("\n")}`);
      }

      return [validationResult.data, undefined];
    } catch (error) {
      return return_error(`設定ファイルの読み込みに失敗しました: ${error}`);
    }
  }

  private async createCredentialsTemplate(): Promise<void> {
    await fs.mkdir(join(process.cwd(), "./env"), { recursive: true });

    const templateWithComments = CREDENTIALS_COMMENTS + "\n" + JSON.stringify(CredentialsTemplate, null, 2);

    await fs.writeFile(this.credentialsPath, JSON.stringify(CredentialsTemplate, null, 2));
    await fs.writeFile(this.credentialsPath + ".example", templateWithComments);

    console.log(`📋 認証情報ファイルテンプレートを作成しました:`);
    console.log(`  - ${this.credentialsPath}`);
    console.log(`  - ${this.credentialsPath}.example (コメント付き)`);
  }

  private async createConfigTemplate(): Promise<void> {
    await fs.mkdir(join(process.cwd(), "./env"), { recursive: true });

    const templateWithComments = CONFIG_COMMENTS + "\n" + JSON.stringify(AuthConfigTemplate, null, 2);

    await fs.writeFile(this.configPath, JSON.stringify(AuthConfigTemplate, null, 2));
    await fs.writeFile(this.configPath + ".example", templateWithComments);

    console.log(`📋 設定ファイルテンプレートを作成しました:`);
    console.log(`  - ${this.configPath}`);
    console.log(`  - ${this.configPath}.example (コメント付き)`);
  }

  private async saveConfig(config: AuthConfig): Promise<void> {
    await fs.mkdir(join(process.cwd(), "./env"), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  private formatZodErrors(error: ZodError): string[] {
    return error.errors.map(err => {
      const path = err.path.join(".");
      return `${path}: ${err.message}`;
    });
  }

  private async authenticateSheets(credentials: Credentials): Promise<ErrorHandleType<void>> {
    try {
      const [, error] = await handle_error_async2(this.sheetService.auth(credentials));
      if (error) {
        return return_error(`Sheets認証エラー: ${error.error_message}`);
      }
      return [undefined, undefined];
    } catch (error) {
      return return_error(`Sheets認証で予期しないエラー: ${error}`);
    }
  }

  private async authenticateDrive(): Promise<ErrorHandleType<void>> {
    try {
      const driveCredentials: drive_credential_type = {
        credential_full_path: this.credentialsPath,
      };
      this.driveService.auth(driveCredentials);
      return [undefined, undefined];
    } catch (error) {
      return return_error(`Drive認証エラー: ${error}`);
    }
  }

  private async testServices(services: AuthConfig["services"]): Promise<string[]> {
    const errors: string[] = [];

    // Google Sheetsテスト
    try {
      await this.sheetService.setSheetID(services.sheet_id);
      await this.sheetService.getMatchInfo();
      await this.sheetService.loadTeams();
      this.sendStatusMessage("success", "sheets-test", "Google Sheetsサービステストが完了しました");
    } catch (error) {
      const errorMsg = `Google Sheetsサービステスト失敗: ${error}`;
      errors.push(errorMsg);
      this.sendStatusMessage("error", "sheets-test", "Google Sheetsサービステストに失敗しました", [String(error)]);
    }

    // Google Driveテスト
    try {
      await this.driveService.clientCheck(services.drive_id);
      this.sendStatusMessage("success", "drive-test", "Google Driveサービステストが完了しました");
    } catch (error) {
      const errorMsg = `Google Driveサービステスト失敗: ${error}`;
      errors.push(errorMsg);
      this.sendStatusMessage("error", "drive-test", "Google Driveサービステストに失敗しました", [String(error)]);
    }

    return errors;
  }

  get authConfig(): AuthConfig | null {
    return this.config;
  }

  get downloadDirectory(): string {
    return this.config?.services.download_directory || "";
  }

  get driveId(): string {
    return this.config?.services.drive_id || "";
  }

  isAuthenticated(): boolean {
    // 認証は毎回実行されるため、configが存在すれば認証済みとみなす
    return this.config !== null && this.credentials !== null;
  }

  getSheetService(): SheetService {
    return this.sheetService;
  }

  getDriveService(): DriveService {
    return this.driveService;
  }
}
