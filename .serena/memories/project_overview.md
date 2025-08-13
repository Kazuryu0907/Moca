# Moca - プロジェクト概要

## プロジェクトの目的
MocaはRocket Leagueオーバーレイアプリケーションで、特にVTuberトーナメント（GracesBlaze）向けに設計されています。リアルタイムマッチオーバーレイを提供し、プレイヤー統計、スコア、チーム情報をGoogle SheetsとGoogle Driveと連携して管理します。

## 技術スタック
- **フレームワーク**: Electron (デスクトップアプリ)
- **フロントエンド**: React 18.3, TypeScript 5.6
- **スタイリング**: TailwindCSS
- **パッケージマネージャー**: Bun
- **バンドラー**: Webpack 5
- **言語**: TypeScript (strict mode enabled)

## 主要依存関係
- **Google API**: googleapis, google-auth-library, google-spreadsheet
- **リアルタイム通信**: ws (WebSocket)
- **その他**: dotenv, zod, qrcode.react, update-electron-app

## アーキテクチャ
```
Rocket League Game → UDP (port 12345) → WebSocket Server (port 8001) → Browser Overlays
```

### コア通信パターン
- UDPサーバーでRocket Leagueからデータを受信 (port 12345)
- WebSocketサーバーでブラウザオーバーレイにリアルタイム配信 (port 8001)
- Google Sheets/Driveとの同期でチーム・プレイヤーデータ管理

## 主要モジュール
- **Main Process** (`src/main.ts`): `Moca`クラスですべてのサービスを統制
- **Socket Communication** (`src/api/socket_communication.ts`): WebSocketとUDPサーバー処理
- **Google Integration**:
  - `src/api/google_spreadsheet.ts`: Google Sheetsとの連携
  - `src/api/google_drive.ts`: Google Drive資産管理
- **Match Logic** (`src/api/set_point.ts`): スコア追跡とマッチ状態
- **Authentication** (`src/api/auth/`): Google API認証管理

## オーバーレイシステム
`graphics/`内のHTMLオーバーレイがWebSocketでリアルタイム更新:
- ブラウザソースエンドポイント:
  - `/boost` - メインマッチオーバーレイ
  - `/stats` - 統計オーバーレイ
  - `/score` - スコア表示のみ
  - `/playerName` - プレイヤー名
  - `/nextMatch` - 次のマッチ情報

## 認証・設定
- Google Sheets/Drive API アクセス必須
- 認証情報: `./env/credential.json`
- 設定ファイル: `./env/config.json`
- Service Account認証 (Sheets) + OAuth2 (Drive)