# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Microsoft Teams のクリップボード HTML からメンション情報（`aria-label`、`type`、`mri` 属性）を抽出・表示するシングルページツール。

## ファイル構成

ビルドツール・依存関係なし。`index.html` をブラウザで直接開くだけで動作する。

| ファイル | 役割 |
|----------|------|
| `index.html` | HTML 構造のみ。`style.css` と `main.js` を参照 |
| `style.css` | GitHub UI を参考にしたライトテーマのスタイル |
| `main.js` | データ処理・DOM 操作・イベント登録 |

## アーキテクチャ

### データフロー

```
クリップボード（Teams HTMLコピー）
  → analyzeClipboard()   : Clipboard API で text/html を取得
  → extractMentions(html): DOMParser で <mention> 要素を抽出
  → parseMRI(mri)        : MRI を "prefix:id_type:id" 形式で分解
  → renderResults(items) : 結果をカード形式で表示
```

### 主要関数（main.js）

| 関数 | 役割 |
|------|------|
| `analyzeClipboard()` | ボタンクリック時のエントリーポイント。Clipboard API でクリップボードの HTML を読み取り、抽出・描画を呼び出す |
| `extractMentions(html)` | `<mention>` 要素から `aria-label`・`type`・`mri` を抽出 |
| `parseMRI(mri)` | `prefix:id_type:id` 形式の MRI 文字列を `{ raw, prefix, id_type, id }` に分解 |
| `renderResults(items)` | 抽出結果をカード UI として DOM に描画 |
| `createRow(label, value, emphasis, indent)` | ラベル＋値の行要素を生成（クリックでコピー可）。`indent: true` で字下げスタイルを適用 |

### MRI 形式

Teams の MRI（Message Routing Identifier）はコロン区切りで構成される：

```
<prefix>:<id_type>:<id>
例: 8:orgid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

MRI のサブフィールド（prefix / id_type / id）はカード内に字下げで表示する（左ボーダーなし）。

### UI 構成

- **アプリ説明**（`page-header`）: h1 + 説明文。枠線なし
- **使い方**（`section-heading` + `how-to`）: 番号付きリストで手順を表示
- **クリップボードを解析**ボタン: クリックで `analyzeClipboard()` 呼び出し
- **クリップボードから取得した HTML ソース**: 読み取り専用 textarea に生 HTML を表示
- **MRI 抽出結果**: メンションごとにカード形式で aria-label / type / mri を表示

## 注意点

- Clipboard API はセキュアコンテキスト（`https://` または `localhost`）が必要。ローカルの `file://` では動作しない。
- 対象ブラウザは Clipboard API をサポートするモダンブラウザのみ
- UI は日本語表示（`lang="ja"`）
- エラー発生時はユーザー向けメッセージを画面に表示し、生のエラー情報は `console.error` に出力する
