# 命名規則修正計画 - 2025/06/18

## 背景

CLAUDE.mdで定義された命名規則に従い、コードベース全体の一貫性を向上させる。

### 命名規則 (CLAUDE.mdより)
- **UpperCamelCase**: class/interface/type/enum/decorator/type parameters/component functions/JSX
- **lowerCamelCase**: variable/parameter/function/method/property/module alias
- **CONSTANT_CASE**: global constant values/enum values

## 修正対象と優先度

### 🟡 **中優先度 - ファイル名・関数名**

#### 10. Brower.tsx → Browser.tsx
- **ファイル**: `src/web/components/Brower.tsx`
- **影響範囲**: App.tsx, ControllerAccess.tsx
- **修正理由**: スペルミス修正

#### 11. handle_error_async → handleErrorAsync
- **ファイル**: `src/common/handle_error.ts`
- **影響範囲**: AuthManager.ts等複数ファイル
- **修正理由**: 関数名はlowerCamelCase、snake_case禁止

#### 12. handle_error_async2 → handleErrorAsync2
- **ファイル**: `src/common/handle_error.ts`
- **影響範囲**: AuthManager.ts等複数ファイル
- **修正理由**: 関数名はlowerCamelCase、snake_case禁止

#### 13. return_error → returnError
- **ファイル**: `src/common/handle_error.ts`
- **影響範囲**: AuthManager.ts等複数ファイル
- **修正理由**: 関数名はlowerCamelCase、snake_case禁止

### 🟢 **低優先度 - プロパティ名**

#### 14. error_message → errorMessage
- **ファイル**: `src/common/handle_error.ts`
- **クラス**: ErrorClass
- **修正理由**: プロパティ名はlowerCamelCase、snake_case禁止

## 修正実行計画

### Phase 3: ファイル名修正
1. `Brower.tsx` → `Browser.tsx`
- `git mv`でファイル移動
- インポート文の更新

### Phase 4: 関数名修正
1. `handle_error_async` → `handleErrorAsync`
2. `return_error` → `returnError`
- 関数定義と全呼び出し箇所を同時更新

### Phase 5: プロパティ名修正
1. `error_message` → `errorMessage`
- 全体的な一貫性向上

## 修正時の注意点

### 技術的注意事項
- **一括修正**: 関連する全ての参照を同時更新
- **TypeScript検証**: 各修正後にコンパイルエラー確認
- **Git履歴保持**: ファイル名変更は`git mv`使用

### 検証手順
1. 修正後の`bun run check`実行
2. 開発サーバー起動確認
3. 基本機能テスト

### リスク管理
- 修正は段階的に実行
- 各フェーズごとに動作確認
- 問題発生時は即座にロールバック

## 期待される効果

### 保守性向上
- 一貫した命名規則による可読性向上
- 新規開発者のオンボーディング効率化

### 開発効率向上
- IDE補完機能の向上
- 命名迷いの削減

### コード品質向上
- TypeScript型システムとの親和性向上
- ESLintルールとの整合性

## ステータス

- **作成日**: 2025-06-18
- **ステータス**: 計画策定完了
- **次のアクション**: Phase 1実行の承認待ち

## 実行ログ

実行時には以下の形式で進捗を記録：

```
- [ ] Phase 1: クラス名修正
  - [ ] setPointModule → SetPointModule
  - [ ] socketComm → SocketComm
- [ ] Phase 2: 型名修正
  - [ ] drive_credential_type → DriveCredentialType
  - [ ] sheet_credential_type → SheetCredentialType
  - ...
```
