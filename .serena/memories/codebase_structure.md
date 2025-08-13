# コードベース構造

## ルートディレクトリ構造

```
Moca/
├── .claude/              # Claude Code設定
├── decision/             # 決定事項・ドキュメント
├── electron/             # Electron関連設定
├── env/                  # 環境設定ファイル
├── graphics/             # HTMLオーバーレイファイル・アセット
├── src/                  # メインソースコード
├── tests/                # テストファイル
├── web/                  # Webアセット（未使用の可能性）
├── package.json          # プロジェクト設定・依存関係
├── tsconfig.json         # TypeScript設定
├── webpack.config.ts     # Webpack設定
├── tailwind.config.js    # TailwindCSS設定
├── eslint.config.mjs     # ESLint設定
├── dprint.json           # dprintフォーマット設定
├── .prettierrc           # Prettier設定
└── CLAUDE.md             # Claude Code用プロジェクト指示
```

## src/ ディレクトリ詳細

### メインファイル
- `src/main.ts`: Electronメインプロセス、`Moca`クラスで全体統制
- `src/preload.ts`: レンダラープロセス用プリロードスクリプト

### API・サービス層 (src/api/)
```
src/api/
├── auth/
│   ├── AuthConfig.ts     # 認証設定
│   └── AuthManager.ts    # 認証管理クラス
├── caches.ts             # キャッシュ管理
├── google_drive.ts       # Google Drive API連携
├── google_spreadsheet.ts # Google Sheets API連携
├── hash.ts               # ハッシュ機能
├── set_point.ts          # マッチスコア・ポイント管理
└── socket_communication.ts # WebSocket・UDP通信
```

### UI層 (src/web/)
```
src/web/
├── components/
│   ├── AuthStatus.tsx    # 認証状態表示
│   ├── Browser.tsx       # ブラウザコンポーネント
│   ├── BrowserBands.tsx  # ブラウザバンド表示
│   ├── ControllerAccess.tsx # コントローラーアクセス
│   ├── Debug.tsx         # デバッグ用コンポーネント
│   ├── IdTable.tsx       # ID表示テーブル
│   ├── Loading.tsx       # ローディング表示
│   ├── Main.tsx          # メインUIコンポーネント
│   ├── Overlay.tsx       # オーバーレイコンポーネント
│   ├── Teams.tsx         # チーム情報表示
│   └── types.ts          # コンポーネント用型定義
├── styles/
│   └── globals.css       # グローバルCSS
├── App.tsx               # メインAppコンポーネント
├── index.html            # HTML エントリーポイント
└── index.tsx             # React エントリーポイント
```

### 共通ライブラリ (src/common/)
```
src/common/
├── handle_error.ts       # エラーハンドリング
└── types.ts              # 共通型定義
```

## graphics/ ディレクトリ
HTMLオーバーレイファイルとアセット管理：
- ブラウザソースとして使用されるオーバーレイHTMLファイル
- プレイヤー画像・動画などのアセット（Google Drive連携）

## 重要なアーキテクチャクラス

### Mocaクラス (src/main.ts)
- アプリケーション全体の中心的なオーケストレーター
- 主要プロパティ:
  - `authManager`: 認証管理
  - `socket`: WebSocket・UDP通信
  - `setPointModule`: スコア管理
  - `ss`: Google Spreadsheet service
  - `ds`: Google Drive service
  - `caches`: キャッシュ管理

### SocketCommクラス (src/api/socket_communication.ts) 
- WebSocketサーバー (port 8001)
- UDPサーバー (port 12345) 
- Rocket LeagueとブラウザオーバーレイのRealtimeブリッジ

## 設定ファイル階層
1. **TypeScript**: `tsconfig.json` (strict mode, path aliases)
2. **Webpack**: `webpack.config.ts` (バンドル設定)
3. **ESLint**: `eslint.config.mjs` (コード品質)
4. **Format**: `dprint.json`, `.prettierrc` (コードスタイル)
5. **CSS**: `tailwind.config.js` (スタイリング)