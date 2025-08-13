# 推奨コマンド一覧

## 開発用コマンド

### メインアプリケーション開発
```bash
bun run dev          # 開発環境（ホットリロード付き）
bun run build        # 本番ビルド
bun run check        # TypeScript型チェック
bun run pack         # 実行可能ファイルとしてパッケージ
bun run dist         # 配布可能なファイル作成
bun run fmt          # コードフォーマット (dprint)
```

### デバッグ
```bash
bun run debug        # webpack-dev-server によるデバッグ
```

## 品質管理コマンド

### フォーマット・リント
```bash
bun run fmt          # dprint によるフォーマット
bun run check        # TypeScript型チェック
```

注意: プロジェクトにはESLint設定がありますが、package.jsonにlintスクリプトは定義されていません。

## システムコマンド (Windows)

### 基本的なファイル操作
```powershell
dir                  # ディレクトリ内容表示 (ls相当)
cd <path>            # ディレクトリ移動
mkdir <name>         # ディレクトリ作成
type <file>          # ファイル内容表示 (cat相当)
findstr <pattern>    # 文字列検索 (grep相当)
```

### Git操作
```bash
git status           # 変更状況確認
git add .            # 変更をステージング
git commit -m "msg"  # コミット
git push             # リモートにプッシュ
```

## 開発フロー推奨手順

1. **開発開始**: `bun run dev`
2. **型チェック**: `bun run check` 
3. **フォーマット**: `bun run fmt`
4. **本番ビルド**: `bun run build`
5. **パッケージ化**: `bun run pack`
6. **配布**: `bun run dist`

## タスク完了時に実行すべきコマンド
- `bun run check` - TypeScript型エラーがないことを確認
- `bun run fmt` - コードフォーマットを実行
- 必要に応じて `bun run build` でビルドが通ることを確認