import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { handle_error2 } from "./handle_error";

export interface GoogleCredentials {
  client_email: string;
  private_key: string;
}

export interface ServiceConfig {
  sheet_id: string;
  drive_id: string;
  download_directory: string;
}

export interface AppConfig {
  credentials: GoogleCredentials;
  services: ServiceConfig;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;
  
  private readonly ENV_BASE_PATH = "./env";
  private readonly CONFIG_FILE_PATH = "./app_config.json";
  
  private constructor() {}
  
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }
  
  get fullConfigPath(): string {
    return join(process.cwd(), this.ENV_BASE_PATH, this.CONFIG_FILE_PATH);
  }
  
  // 設定ファイル読み込み
  async loadConfig(): Promise<AppConfig> {
    const configPath = this.fullConfigPath;
    
    if (!existsSync(configPath)) {
      this.config = this.createDefaultConfig();
      await this.saveConfig(this.config);
      return this.config;
    }
    
    const [data, readError] = handle_error2(() => readFileSync(configPath, 'utf-8'));
    if (readError || !data) {
      throw new Error(`設定ファイル読み込みエラー: ${readError?.message || 'データが空です'}`);
    }
    
    const [parsedConfig, parseError] = handle_error2(() => JSON.parse(data));
    if (parseError) {
      throw new Error(`設定ファイル形式エラー: ${parseError.message}`);
    }
    
    this.config = this.validateAndNormalizeConfig(parsedConfig);
    return this.config;
  }
  
  // 設定ファイル保存
  async saveConfig(config: AppConfig): Promise<void> {
    const configPath = this.fullConfigPath;
    const configDir = join(process.cwd(), this.ENV_BASE_PATH);
    
    // ディレクトリが存在しない場合は作成
    if (!existsSync(configDir)) {
      const fs = await import('fs');
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const [, writeError] = handle_error2(() => 
      writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
    );
    
    if (writeError) {
      throw new Error(`設定ファイル保存エラー: ${writeError.message}`);
    }
    
    this.config = config;
  }
  
  // 設定の検証
  validateConfig(config: any): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // credentials検証
    if (!config.credentials) {
      errors.push("credentials is required");
    } else {
      if (!config.credentials.client_email) {
        errors.push("credentials.client_email is required");
      } else if (!this.isValidEmail(config.credentials.client_email)) {
        warnings.push("credentials.client_email format may be invalid");
      }
      
      if (!config.credentials.private_key) {
        errors.push("credentials.private_key is required");
      } else if (!config.credentials.private_key.includes('BEGIN PRIVATE KEY')) {
        warnings.push("credentials.private_key format may be invalid");
      }
    }
    
    // services検証
    if (!config.services) {
      errors.push("services is required");
    } else {
      if (!config.services.sheet_id) {
        warnings.push("services.sheet_id is empty");
      } else if (!this.isValidGoogleSheetId(config.services.sheet_id)) {
        warnings.push("services.sheet_id format may be invalid");
      }
      
      if (!config.services.drive_id) {
        warnings.push("services.drive_id is empty");
      } else if (!this.isValidGoogleDriveId(config.services.drive_id)) {
        warnings.push("services.drive_id format may be invalid");
      }
      
      if (!config.services.download_directory) {
        warnings.push("services.download_directory is empty");
      } else if (!existsSync(config.services.download_directory)) {
        warnings.push("services.download_directory does not exist");
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // 設定の正規化
  private validateAndNormalizeConfig(config: any): AppConfig {
    const validation = this.validateConfig(config);
    
    if (!validation.valid) {
      throw new Error(`設定検証エラー: ${validation.errors.join(', ')}`);
    }
    
    // 警告をログ出力
    if (validation.warnings.length > 0) {
      console.warn(`設定警告: ${validation.warnings.join(', ')}`);
    }
    
    return {
      credentials: {
        client_email: config.credentials.client_email || "",
        private_key: config.credentials.private_key || ""
      },
      services: {
        sheet_id: config.services.sheet_id || "",
        drive_id: config.services.drive_id || "",
        download_directory: config.services.download_directory || ""
      }
    };
  }
  
  // デフォルト設定作成
  private createDefaultConfig(): AppConfig {
    return {
      credentials: {
        client_email: "",
        private_key: ""
      },
      services: {
        sheet_id: "",
        drive_id: "",
        download_directory: ""
      }
    };
  }
  
  // 個別設定更新
  async updateCredentials(credentials: Partial<GoogleCredentials>): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    this.config!.credentials = {
      ...this.config!.credentials,
      ...credentials
    };
    
    await this.saveConfig(this.config!);
  }
  
  async updateServices(services: Partial<ServiceConfig>): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    this.config!.services = {
      ...this.config!.services,
      ...services
    };
    
    await this.saveConfig(this.config!);
  }
  
  // 現在の設定取得
  getCurrentConfig(): AppConfig | null {
    return this.config;
  }
  
  // バリデーションヘルパー
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  private isValidGoogleSheetId(id: string): boolean {
    return /^[a-zA-Z0-9-_]{44}$/.test(id);
  }
  
  private isValidGoogleDriveId(id: string): boolean {
    return /^[a-zA-Z0-9-_]{28,}$/.test(id);
  }
  
  // 従来のファイル形式からの移行
  async migrateFromLegacyFiles(): Promise<boolean> {
    const credentialPath = join(process.cwd(), this.ENV_BASE_PATH, "credential.json");
    const configPath = join(process.cwd(), this.ENV_BASE_PATH, "config.json");
    
    let migrated = false;
    const newConfig = this.createDefaultConfig();
    
    // credential.json移行
    if (existsSync(credentialPath)) {
      const [credData, credError] = handle_error2(() => 
        JSON.parse(readFileSync(credentialPath, 'utf-8'))
      );
      
      if (!credError && credData) {
        newConfig.credentials = {
          client_email: credData.client_email || "",
          private_key: credData.private_key || ""
        };
        migrated = true;
      }
    }
    
    // config.json移行
    if (existsSync(configPath)) {
      const [serviceData, serviceError] = handle_error2(() => 
        JSON.parse(readFileSync(configPath, 'utf-8'))
      );
      
      if (!serviceError && serviceData) {
        newConfig.services = {
          sheet_id: serviceData.sheet_id || "",
          drive_id: serviceData.drive_id || "",
          download_directory: serviceData.download_directory || ""
        };
        migrated = true;
      }
    }
    
    if (migrated) {
      await this.saveConfig(newConfig);
      console.log("[ConfigManager] Legacy files migrated to new config format");
    }
    
    return migrated;
  }
}