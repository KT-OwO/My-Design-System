# My-Design-System
My Design System

## テーマ

`styles.css` を読み込み、`<html>` の `data-theme` で切り替えます。

| `data-theme` | 配色 |
| --- | --- |
| `noodle` | 生成りと朱色。属性を省略した場合もこのテーマになります。 |
| `dark` | 墨色の背景と明るい朱色。 |
| `forest` | 淡い緑の背景と深緑。 |
| `high-contrast` | 白地に黒の文字と濃紺のアクセント。 |

```html
<html lang="ja" data-theme="dark">
```

ボタンなどには既存の Carbon クラスを使用します。以前の `kt--noodle` や
`cds--white`、`cds--g10`、`cds--g90`、`cds--g100` によるテーマ指定は、
`data-theme` に置き換えてください。

## 文字サイズ

`:root` の `--font-family` は、端末にある IBM Plex Sans JP、IBM Plex Sans、システムのサンセリフ書体の順に使います。
書体を明示する場合は `mds--font-sans` を使います。

`:root` に共通の文字サイズを定義しています。

- `--font-size-01`（12px）はラベルや補助表示に使います。
- `--font-size-02`（14px）は本文とボタンの基準です。

`h1`〜`h6` の文字サイズはブラウザの既定値を使います。

文字の太さは `--font-weight-01`（300）、`--font-weight-02`（400）、
`--font-weight-03`（600）で指定します。本文の標準は400です。

行高は `--line-height-01`（1.25、コンパクトなUI）、`--line-height-02`（1.4、標準）、
`--line-height-03`（1.5、複数行の本文）の3段階です。
