# Mugi

## Todo
### envファイルの編集
| conifig | 説明 |
| ---- | ---- |
|  SPREADSHEET_ID | 参照するGoogle SpreadsheetのID |
| GOOGLEDRIVE_ID|Google DriveのディレクトリID|
| GRAPHICS_DIR |Overlay素材をDLするディレクトリ(絶対パス) |

### SpreadSheet
SpreadSheetの共有をONに．

### GoogleDrive
Mugiの初回起動時に，Google認証が入るので，GoogleDriveで使用するアカウントで認証.


### Overlayについて
Overlayは `./graphics/`の中にあり，それぞれ以下のよう．
| ファイル | 説明 |
| ---- | ---- |
| nextMatch.html |対戦のマッチアップ |
|  matching.html | 試合中のboost,スコア,アイコン,トランジションを担う |
| stats.html |試合終了後のstats画面|  

### 起動後
1. 自動で認証が走るので，エラーが出たら教えて下さい．
2. Google Driveタブから，**Update**ボタンを押すと，`GOOGLEDRIVE_ID`で指定したファイルから画像をDLします．
3. SpreadSheetタブは，SpreadSheetのフォーマットに依存するので追々．
4. Overlayに関しては，特にMoca側での操作は必要ないです．


# Moca
Prasに変わるbakkesmod plugin．