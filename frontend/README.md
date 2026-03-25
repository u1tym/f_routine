# ルーティン管理 フロントエンド

Vue 3 + TypeScript + Vite で構築したルーティン管理アプリです。

---

## 動作環境

- Node.js 20.19+ または 22.12+（Vite 5 の場合は 18+ で動作）
- npm

---

## セットアップ

```bash
cd frontend
npm install
```

---

## 環境設定

`frontend/.env` でバックエンド API の起点 URL を設定します。

```env
VITE_ROUTINE_ORIGIN=http://127.0.0.1:8000
```

別のサーバーに向ける場合はこの値を変更して、開発サーバーを再起動してください。

---

## 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173/` を開いてください。

---

## ビルド

```bash
npm run build
```

`dist/` ディレクトリに本番用ファイルが生成されます。

---

## 主な機能

| 機能 | 説明 |
|------|------|
| ルーティン一覧 | 名称・カテゴリ・適用日・除外/調整設定を一覧表示 |
| 新規追加 | ルーティンを新規作成 |
| 編集 | 既存ルーティンの内容を変更（削除→再作成で実現） |
| 削除 | ルーティンを論理削除 |
| 個別スケジュール追加 | ルーティンを選択して年・月を指定しスケジュールを追加 |
| 全件スケジュール追加 | 全ルーティンに対して年・月を指定しスケジュールを一括追加 |

---

## ファイル構成

```
src/
  types/index.ts          # API 型定義
  api/
    client.ts             # fetch ラッパー（API起点の読み込み）
    routines.ts           # ルーティン関連 API 呼び出し
  utils/adaptLabel.ts     # 適用日の日本語表示ヘルパー
  components/
    RoutineList.vue       # 一覧・削除・ボタン群
    RoutineForm.vue       # 追加/編集モーダル
    ApplyModal.vue        # スケジュール追加モーダル
  App.vue
  style.css               # スマホ向けスタイル
```
