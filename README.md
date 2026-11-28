# My-Design-System
Carbon をベースにした、テーマ切り替え可能な HTML・CSS・JavaScript のデザインシステムです。

- [コンポーネントカタログ](index.html) · [利用仕様](docs/components.md) · [画面パターン](docs/patterns.html)
- [開発と検証](CONTRIBUTING.md) · [変更履歴](CHANGELOG.md)

## 参照する

GitHub MCP から参照する場合は、まず [利用仕様](docs/components.md) で必要なHTMLとクラスを確認します。見た目の定義は [styles.css](styles.css) と [themes/](themes/) にあり、動作が必要な例は [runtime/browser.js](runtime/browser.js) を使います。

カタログは `index.html` をブラウザーで直接開けます。GitHub Pages でリポジトリのルートを公開元にすると、サイトのトップにカタログが表示されます。表示にはリポジトリ内の静的ファイルを使います。CI では Chromium、Firefox、WebKit で主要な操作を検証します。

## テーマ

共通スタイルの `styles.css` と、使用するテーマの CSS を読み込みます。テーマを動的に切り替える場合は、すべてのテーマ CSS を読み込んで `<html>` の `data-theme` を変更します。

```html
<link rel="stylesheet" href="./styles.css">
<link rel="stylesheet" href="./themes/noodle.css">
<link rel="stylesheet" href="./themes/dark.css">
<link rel="stylesheet" href="./themes/forest.css">
<link rel="stylesheet" href="./themes/high-contrast.css">
```

| `data-theme` | 配色 |
| --- | --- |
| `noodle` | 生成りと朱色。属性を省略した場合もこのテーマになります。 |
| `dark` | 墨色の背景と明るい朱色。 |
| `forest` | 淡い緑の背景と深緑。 |
| `high-contrast` | 白地に黒の文字と濃紺のアクセント。 |

```html
<html lang="ja" data-theme="dark">
```

ボタンなどには `mds--btn` をはじめとする `mds--` クラスを使用します。以前の `kt--noodle` や
`cds--white`、`cds--g10`、`cds--g90`、`cds--g100` によるテーマ指定は、
`data-theme` に置き換えてください。

## 文字サイズ

`:root` の `--font-family` は、端末にある IBM Plex Sans JP、IBM Plex Sans、システムのサンセリフ書体の順に使います。
書体を明示する場合は `mds--font-sans` を使います。

`:root` に共通の文字サイズを定義しています。

- `--font-size-01`（12px）はラベルや補助表示に使います。
- `--font-size-02`（14px）は本文とボタンの基準です。

見た目を揃える場合は `mds--type-heading-01`〜`mds--type-heading-06` を付けます。文書構造に合わせてHTMLの見出しレベルを選び、見た目のサイズはクラスで指定します。大見出し用の `mds--type-display` は画面幅に追従し、本文、ラベル、コードには `mds--type-body`、`mds--type-label`、`mds--type-code` を使えます。本体は端末のフォントを使います。製品で書体を固定する場合は、製品側でライセンスを確認して読み込んでください。

文字の太さは `--font-weight-01`（300）、`--font-weight-02`（400）、
`--font-weight-03`（600）で指定します。本文の標準は400です。

行高は `--line-height-01`（1.25、コンパクトなUI）、`--line-height-02`（1.4、標準）、
`--line-height-03`（1.5、複数行の本文）の3段階です。

## トークン

原本は [tokens/source.json](tokens/source.json) です。共通スケールとテーマの基本色を定義し、用途別の色や文字サイズをセマンティックトークンに割り当てます。原本を編集したときは `npm run build` で CSS を更新します。画面では用途を表す `--mds-text-primary` などを使い、`--kt-*` はテーマ内部値として扱います。

## アイコン

[svg/](svg/) から必要なサイズのファイルを選びます。使用例は `./svg/16/search.svg` です。ファイル名の大文字・小文字と `--filled` などの接尾辞を維持してください。装飾画像は `alt=""` を付け、アイコンだけの操作にはボタンに名前を付けます。出典とライセンスは [NOTICE](NOTICE) を参照してください。
