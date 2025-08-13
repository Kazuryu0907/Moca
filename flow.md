# Moca - Rocket League オーバーレイシステム フロー図

```mermaid
graph TD
    %% ゲーム入力
    A[Rocket League Game] --> B[UDP Server<br/>Port 12345]
    
    %% メインプロセス
    C[Electron Main Process] --> D[Moca Class]
    D --> E[認証管理<br/>AuthManager]
    D --> F[Socket通信<br/>SocketComm]
    D --> G[スコア管理<br/>SetPointModule]
    D --> H[Google Sheets<br/>SheetService]
    D --> I[Google Drive<br/>DriveService]
    D --> J[キャッシュ<br/>Caches]
    
    %% 認証フロー
    E --> K[Service Account<br/>credential.json]
    E --> L[OAuth2 認証]
    K --> H
    L --> I
    
    %% 通信レイヤー
    B --> F
    F --> M[WebSocket Server<br/>Port 8001]
    
    %% オーバーレイブラウザ接続
    M --> N[Browser Overlay Clients]
    N --> O[boost - メインオーバーレイ]
    N --> P[stats - 統計オーバーレイ] 
    N --> Q[nextMatch - 次試合情報]
    N --> R[score - スコア表示]
    N --> S[playerName - プレイヤー名]
    
    %% HTMLオーバーレイファイル
    O --> T[graphics/matching.html]
    P --> U[graphics/stats.html]
    Q --> V[graphics/nextMatch.html]
    
    %% データソース
    H --> W[Google Sheets<br/>チーム・プレイヤー情報]
    I --> X[Google Drive<br/>プレイヤー画像・動画]
    
    %% React UI (制御パネル)
    D --> Y[Browser Window]
    Y --> Z[React App]
    Z --> AA[Main.tsx]
    AA --> AB[Teams.tsx]
    AA --> AC[Overlay.tsx]
    AA --> AD[Debug.tsx]
    AA --> AE[AuthStatus.tsx]
    
    %% IPC通信
    Z --> AF[IPC Handlers]
    AF --> D
    
    %% リアルタイムデータフロー
    B --> AG[UDP Data Processing]
    AG --> AH[Command Listeners]
    AH --> AI[boost, playerTable, etc.]
    AI --> M
    
    %% データ同期
    W --> AJ[Match Info Cache]
    X --> AK[Asset Download]
    AJ --> M
    AK --> AL[Local Graphics Assets]
    
    %% WebSocket データ配信
    M --> AM[Real-time Data Broadcast]
    AM --> T
    AM --> U
    AM --> V
    
    %% ファイルシステム
    AL --> AN[graphics/assets/]
    AN --> T
    
    style A fill:#ff9999
    style D fill:#ffcc99
    style F fill:#99ccff
    style M fill:#ccffff
    style H fill:#ccffcc
    style I fill:#ccffcc
```

## システム概要

### アーキテクチャ
- **デスクトップアプリ**: Electron + React + TypeScript
- **リアルタイム通信**: WebSocket (port 8001) + UDP (port 12345)
- **外部連携**: Google Sheets API + Google Drive API
- **オーバーレイ**: HTML/CSS/JavaScript ブラウザソース

### コア通信パターン
```
Rocket League → UDP (12345) → WebSocket Server (8001) → Browser Overlays
                     ↓
               Command Processing → Google Services Integration
```

### 主要コンポーネント

#### メインプロセス (src/main.ts)
- **Mocaクラス**: 全システムのオーケストレーター
- **AuthManager**: Google認証の管理
- **SocketComm**: UDP/WebSocket通信ハンドリング
- **SetPointModule**: スコア・ポイント管理ロジック

#### 通信システム (src/api/socket_communication.ts)
- **UDPサーバー**: Rocket Leagueからデータ受信 (127.0.0.1:12345)
- **WebSocketサーバー**: ブラウザオーバーレイにリアルタイム配信 (port 8001)
- **コマンドリスナー**: データ処理とルーティング

#### Google統合
- **SheetService**: チーム・プレイヤー情報の管理
- **DriveService**: プレイヤー画像・動画アセットの同期

#### オーバーレイシステム
- **matching.html**: メイン試合オーバーレイ (ブースト、スコア、プレイヤー)
- **stats.html**: 試合後統計表示
- **nextMatch.html**: 次の試合情報表示

### データフロー
1. **ゲームデータ**: Rocket League → UDP → コマンド処理
2. **WebSocket配信**: 処理済みデータ → 全ブラウザクライアント
3. **Google同期**: Sheets/Drive → ローカルキャッシュ → オーバーレイ
4. **UI制御**: React制御パネル → IPC → メインプロセス

### ブラウザソースエンドポイント
- `ws://localhost:8001/boost` - メイン試合オーバーレイ
- `ws://localhost:8001/stats` - 統計オーバーレイ  
- `ws://localhost:8001/nextMatch` - 次試合情報
- `ws://localhost:8001/score` - スコア表示のみ
- `ws://localhost:8001/playerName` - プレイヤー名表示
