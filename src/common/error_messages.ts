export interface ErrorMessage {
  user: string;
  developer: string;
  action: string;
  severity: 'error' | 'warning' | 'info';
}

export const AUTH_ERROR_MESSAGES = {
  CREDENTIAL_PARSE_ERROR: {
    user: "認証ファイルの形式が正しくありません",
    developer: "credential.json parse error",
    action: "正しいcredential.jsonファイルを選択してください",
    severity: 'error' as const
  },
  CREDENTIAL_MISSING_KEYS: {
    user: "認証ファイルに必要な情報が不足しています",
    developer: "client_email or private_key missing in credential.json",
    action: "Google Cloud Consoleから正しいサービスアカウントキーをダウンロードしてください",
    severity: 'error' as const
  },
  SHEET_AUTH_FAILED: {
    user: "スプレッドシートへの認証に失敗しました",
    developer: "Google Sheets API authentication failed",
    action: "サービスアカウントにスプレッドシートへのアクセス権限があるか確認してください",
    severity: 'error' as const
  },
  DRIVE_AUTH_FAILED: {
    user: "Google Driveへの認証に失敗しました",
    developer: "Google Drive API authentication failed", 
    action: "サービスアカウントにDriveへのアクセス権限があるか確認してください",
    severity: 'error' as const
  },
  INVALID_SHEET_ID: {
    user: "スプレッドシートが見つかりません",
    developer: "Sheet ID validation failed",
    action: "正しいスプレッドシートIDを入力してください。URLから取得できます",
    severity: 'error' as const
  },
  INVALID_DRIVE_ID: {
    user: "Google Driveフォルダが見つかりません",
    developer: "Drive folder ID validation failed",
    action: "正しいGoogle DriveフォルダIDを入力してください",
    severity: 'error' as const
  },
  DIRECTORY_NOT_FOUND: {
    user: "保存先フォルダが見つかりません",
    developer: "Download directory not found",
    action: "存在するフォルダを選択してください",
    severity: 'error' as const
  },
  SHEET_STRUCTURE_ERROR: {
    user: "スプレッドシートの構造が想定と異なります",
    developer: "Sheet structure validation failed",
    action: "スプレッドシートに「エントリー一覧/管理表」「進行管理」タブがあるか確認してください", 
    severity: 'error' as const
  }
} as const;

export type AuthErrorType = keyof typeof AUTH_ERROR_MESSAGES;

export function getErrorMessage(errorType: AuthErrorType): ErrorMessage {
  return AUTH_ERROR_MESSAGES[errorType];
}

export function formatUserError(errorType: AuthErrorType, context?: string): string {
  const error = AUTH_ERROR_MESSAGES[errorType];
  let message = `❌ ${error.user}`;
  if (context) {
    message += `\n詳細: ${context}`;
  }
  message += `\n💡 ${error.action}`;
  return message;
}