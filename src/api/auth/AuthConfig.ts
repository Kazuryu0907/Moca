import { z } from "zod";

// 認証情報用スキーマ (credential.json) - Google Service Account形式
export const CredentialsSchema = z.object({
  type: z.string().optional(),
  project_id: z.string().optional(),
  private_key_id: z.string().optional(),
  private_key: z.string()
    .min(1, "private_keyが必要です"),
  client_email: z.string()
    .email("無効なメールアドレス形式です")
    .min(1, "client_emailが必要です"),
  client_id: z.string().optional(),
  auth_uri: z.string().optional(),
  token_uri: z.string().optional(),
  auth_provider_x509_cert_url: z.string().optional(),
  client_x509_cert_url: z.string().optional(),
  universe_domain: z.string().optional(),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

// メイン設定用スキーマ (auth_config.json)
export const AuthConfigSchema = z.object({
  services: z.object({
    sheet_id: z.string()
      .min(1, "sheet_idが必要です")
      .regex(/^[a-zA-Z0-9-_]+$/, "sheet_idの形式が正しくありません"),
    drive_id: z.string()
      .min(1, "drive_idが必要です")
      .regex(/^[a-zA-Z0-9-_]+$/, "drive_idの形式が正しくありません"),
    download_directory: z.string()
      .min(1, "download_directoryが必要です"),
  }),
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const CredentialsTemplate: Credentials = {
  type: "service_account",
  project_id: "",
  private_key_id: "",
  private_key: "",
  client_email: "",
  client_id: "",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "",
  universe_domain: "googleapis.com",
};

export const AuthConfigTemplate: AuthConfig = {
  services: {
    sheet_id: "",
    drive_id: "",
    download_directory: "",
  },
};

export const CREDENTIALS_COMMENTS = `
// Google Service Account認証情報
// Google Cloud Consoleでサービスアカウントを作成し、キーをダウンロードした際に取得できるJSONファイルをそのまま使用できます

{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v3/certs/your-service-account%40your-project.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
`;

export const CONFIG_COMMENTS = `
// アプリケーション設定ファイル
// 以下のサービス情報を設定してください

{
  "services": {
    // Google SheetsのスプレッドシートID
    "sheet_id": "1ABC...xyz",
    // Google DriveのフォルダID  
    "drive_id": "1DEF...abc",
    // アセットをダウンロードするローカルディレクトリ
    "download_directory": "C:\\\\path\\\\to\\\\download\\\\folder"
  }
}
`;
