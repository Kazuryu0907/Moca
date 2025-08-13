# コードスタイルと規約

## 命名規則 (CLAUDE.md より)

### UpperCamelCase (大文字始まり)
- class
- interface
- type
- enum
- decorator
- type parameters
- component functions in TSX
- JSXElement type parameter

### lowerCamelCase (小文字始まり)
- variable
- parameter
- function
- method
- property
- module alias

### CONSTANT_CASE (大文字・アンダースコア)
- global constant values
- enum values

## TypeScript設定

### tsconfig.json の主要設定
- `strict: true` - 厳格な型チェック有効
- `target: "ESNext"`
- `module: "ESNext"`
- `jsx: "react-jsx"`
- パスエイリアス: `@/*` → `./src/*`

## フォーマット設定

### Prettier (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 80
}
```

### dprint (フォーマッター)
- TypeScript, JSON, Markdown, TOML, CSS, YAML対応
- 実行コマンド: `bun run fmt`

## ESLint設定 (eslint.config.mjs)
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react` flat config recommended
- 対象: `**/*.{js,mjs,cjs,ts,jsx,tsx}`

## コメント規約
- 主にプロジェクトは日本語コメント使用
- 例: `// あとでDIみたいにする`
- コードの説明やTODOは日本語で記述

## プロジェクト特有の規約

### ファイル構成
- `src/api/`: APIとサービスモジュール
- `src/web/`: React UIコンポーネント
- `src/common/`: 共通型定義・ユーティリティ
- `graphics/`: HTMLオーバーレイファイル

### インポート規則
- パスエイリアス `@/` を使用
- 相対インポートと絶対インポートの混在

## 開発言語設定
- このリポジトリでは**日本語**で開発・コメント・ドキュメント作成
- コミットメッセージも日本語推奨

## 品質保証
- タスク完了時には必ず `bun run check` で型チェック実行
- `bun run fmt` でフォーマット統一
- strict TypeScriptモードでの開発を推奨