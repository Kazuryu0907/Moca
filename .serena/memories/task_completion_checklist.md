# タスク完了時のチェックリスト

## 必須確認項目

### 1. 型チェック
```bash
bun run check
```
- TypeScriptの型エラーがないことを確認
- strict modeが有効なため、すべての型が適切に定義されていることを確認

### 2. コードフォーマット
```bash
bun run fmt
```
- dprintによるコードフォーマットを実行
- Prettier設定に従った統一されたスタイルを適用

### 3. ビルド確認（必要に応じて）
```bash
bun run build
```
- 本番環境向けビルドが正常に完了することを確認
- webpack設定に従って正しくバンドルされることを確認

## 開発時の追加確認

### 4. 開発サーバー起動確認（変更時）
```bash
bun run dev
```
- 開発環境で正常に動作することを確認
- ホットリロードが機能することを確認

### 5. パッケージング確認（リリース時）
```bash
bun run pack
```
- Electronアプリとして正常にパッケージされることを確認

## コード品質チェック

### 6. ESLintルール遵守
- eslint.config.mjsで定義されたルールに準拠
- TypeScript推奨設定とReact推奨設定に従う

### 7. 命名規則の確認
- CLAUDE.mdで定義された命名規則に従っているか確認：
  - Classes/Interfaces/Types: `UpperCamelCase`
  - Variables/Functions/Methods: `lowerCamelCase` 
  - Constants: `CONSTANT_CASE`

## プロジェクト特有の確認

### 8. 認証・API連携（該当する場合）
- Google Sheets/Drive API との連携が正常に動作することを確認
- 認証フローに問題がないことを確認

### 9. WebSocket通信（該当する場合）
- リアルタイム通信が正常に動作することを確認
- オーバーレイシステムとの連携確認

### 10. Windows環境対応
- 開発環境はWindowsベース
- Windows固有のパスやコマンドが正しく処理されることを確認

## 完了時のアクション

### システム通知
```powershell
powershell.exe -Command '[System.Media.SystemSounds]::Hand.Play()'
```
- タスク完了時にシステムサウンドを再生（CLAUDE.mdの指定）

### ドキュメント更新（必要に応じて）
- 大きな変更の場合はCLAUDE.mdの更新も検討
- APIや設定の変更があればドキュメント更新