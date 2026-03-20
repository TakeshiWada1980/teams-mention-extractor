# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Microsoft Teams のクリップボード HTML からメンション情報（`aria-label`、`type`、`mri` 属性）を抽出・表示するシングルページツール。

## 実行方法

ビルドツール・依存関係なし。`index.html` をブラウザで直接開くだけで動作する。

## アーキテクチャ

全コードは `index.html` の1ファイルに完結している（HTML + CSS + JavaScript をインライン）。

### データフロー

```
クリップボード（Teams HTMLコピー）
  → readClipboardHtml()  : Clipboard API で text/html を取得
  → extract(html)        : DOMParser で <mention> 要素を抽出
  → parseMRI(mri)        : MRI を "prefix:id_type:id" 形式で分解
  → render(items)        : 結果をカード形式で表示
```

### 主要関数

| 関数 | 役割 |
|------|------|
| `readClipboardHtml()` | Clipboard API でクリップボードの HTML を読み取る |
| `extract(html)` | `<mention>` 要素から `aria-label`・`type`・`mri` を抽出 |
| `parseMRI(mri)` | `prefix:id_type:id` 形式の MRI 文字列を分解 |
| `render(items)` | 抽出結果をカード UI として DOM に描画 |
| `createRow(label, value, emphasis)` | ラベル＋値の行要素を生成（クリックでコピー可） |

### MRI 形式

Teams の MRI（Message Routing Identifier）は コロン区切りで構成される：

```
<prefix>:<id_type>:<id>
例: 8:orgid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 注意点

- Clipboard API はセキュアコンテキスト（`https://` または `localhost`）が必要。ローカルの `file://` では動作しない。
- 対象ブラウザは Clipboard API をサポートするモダンブラウザのみ
- UI は日本語表示（`lang="ja"`）
