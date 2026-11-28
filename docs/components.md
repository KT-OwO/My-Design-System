# コンポーネント利用仕様

下記は利用仕様と動作を定めた公開対象です。カタログのほかの項目は見本として参照できます。

| 対象 | 構造・状態 | 使用場面と操作 |
| --- | --- | --- |
| Button | `button.mds--btn` に `mds--btn--primary`、`mds--btn--secondary`、`mds--btn--tertiary`、`mds--btn--ghost` のいずれかを付ける。サイズは `mds--btn--s`、`mds--btn--m`、`mds--btn--l`。無効状態は `disabled`。 | 主操作を1つに絞り、取り消しにくい操作は対象と結果を明示する。アイコンのみの場合は `aria-label` と `mds--btn--icon-only` を付ける。Space／Enterで操作する。狭い画面では親で折り返す。 |
| Link | `a.mds--link[href]`。文中では `mds--link--inline`。 | 画面やリソースへの移動に使う。リンク文言で移動先を伝える。 |
| Text input | `label[for]` と `input.mds--text-input[id]`、または `textarea.mds--text-area[id]`。必須、読み取り専用、無効状態には対応するHTML属性を使う。 | 補助文やエラーは `aria-describedby` で関連付け、エラー時は `aria-invalid="true"` とカタログのエラー用スタイルを使う。狭い画面ではフォームを1列にする。 |
| Tabs | `[role=tablist]` 内に `button[role=tab]`。各タブに固有のIDと `aria-controls`、パネルに `role=tabpanel` と対応するIDを付ける。 | 同一画面の関連情報を切り替える。左右キー、Home、Endで移動。縦型は `aria-orientation="vertical"` と上下キーを使う。 |
| Disclosure | `button[type=button]` と固有IDを持つ表示領域。初期状態に応じて `hidden` を付ける。 | 補助情報の開閉に使う。Space／Enterで操作する。入力値の選択にはネイティブの `select` を使う。 |
| Modal | `button` と `dialog[aria-labelledby]`。ダイアログ内に見出しと閉じる操作を置く。 | 作業を中断する必要のある確認に使う。初期フォーカスは `autofocus` で指定できる。Escapeで閉じ、起点に戻る。狭い画面では高さと内部スクロールを確認する。 |

[設定フォーム](patterns.html) は入力、確認、結果通知を組み合わせた実行可能な例です。

```html
<button id="show-help" class="mds--btn mds--btn--secondary" type="button"
        aria-controls="help" aria-expanded="false">詳細を表示</button>
<div id="help" hidden>連絡先の詳細</div>
```

```html
<script src="./runtime/browser.js"></script>
<script>
  MyDesignSystem.disclosure(document.querySelector('#show-help'), document.querySelector('#help'));
</script>
```

スクリプトはボタンと表示領域の後に置きます。ファイルのパスは組み込み先に合わせて調整します。

| API | オプション | 返り値 |
| --- | --- | --- |
| `disclosure(button, content, options)` | `expanded` は初期状態。 `onChange(open)` は初期化と切り替え時に呼ばれる。 | `setExpanded(open)`、`destroy()` |
| `dropdown(button, list, options)` | 固有IDと名前を持つ `[role=listbox]` に `button[role=option]` を置く。 `selected` は初期選択の添字、`onSelect(option, index)` は選択用、`onOpenChange(open)` は表示状態用。上下キーで移動しEnterで選択、Escapeで閉じる。 | `select(index)`、`open()`、`close()`、`destroy()` |
| `tabs(list, options)` | `activation` は `automatic` または `manual`。 `onSelect(index)` は初期選択と切り替え時に呼ばれる。CSSの選択用クラスもここで更新できる。 | `select(index)`、`destroy()` |
| `modal(trigger, dialog, options)` | `onClose(value)` は `dialog.returnValue` を受け取る。フォームの検証後に開く場合は `event: null` と `open()` を使う。 | `open()`、`close(value)`、`destroy()` |

`destroy()` はイベントリスナーを解除します。DOM属性や表示状態は最後の状態を保持します。

キーボード操作の参考資料は [WAI Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) と [WAI Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) を参照してください。

## カタログ掲載部品の使い分け

カタログのHTMLにはプレビュー用のクラスやサンプルデータが含まれます。組み込み時はカタログ専用スタイルを除き、製品のデータ・イベント・状態と接続します。

| カテゴリー | 部品と用途 | 組み込み時の確認 |
| --- | --- | --- |
| 基礎 | Typography は見出しと本文の階層、Color tokens はテーマによる色の切り替え、Grid & layout は列幅と余白の調整に使う。 | ナビゲーションや見出しの文書構造を保ち、テーマを切り替えた状態と狭幅の両方を確認する。 |
| 操作 | Menu は対象に対する複数の操作、Copy はコードや値を直接コピーする場合に使う。 | メニューは開いた後のフォーカス、上下キーとEscapeを実装する。コピーの成否は `role="status"` で伝える。 |
| 入力 | Checkbox は独立した複数選択、Radio は排他的な選択、Toggle は切り替えを即時反映する設定。Select は既知の選択肢、Search は候補の絞り込みに使う。 | 選択肢のグループは `fieldset` と `legend`、各入力はラベルを関連付ける。無効、読み取り専用、未選択を区別する。 |
| 入力 | Number、Date、Time は単位と入力形式を限定できる値、Slider は範囲内で調整する値、File uploader はファイルの選択に使う。 | 範囲・形式・単位・ファイル制限を入力前に示す。値やファイル名をテキストでも表示し、エラーから再入力できるようにする。 |
| ナビゲーション | Header と Side navigation は全体の導線、Breadcrumb は現在位置、Content switcher は局所的な表示切り替え、Pagination は項目集合の移動、Progress indicator は複数段階の作業に使う。 | 現在のページや段階は `aria-current` を使う。ページ変更後に結果を通知し、初回・最終ページの状態や狭幅時の導線も確認する。 |
| データ表示 | Data table は列で比較する値、Card と Tiles はまとまりのある項目、Carousel は限られた領域の複数項目、Tag と Badge は分類や状態、Lists と Contained list は列挙に使う。 | 表には見出しセルを置き、ソート時は `aria-sort` を更新する。カードが操作対象ならリンクかボタンを使う。状態に説明を添え、横長の表はスクロールできるようにする。 |
| データ表示 | Accordion は詳細の開閉、Tree view は親子階層、Code snippet はコードの提示、Big number は代表値、Avatar は人物の識別、Empty state はデータが存在しない状況に使う。 | Tree は矢印キーでも階層を移動できるようにする。空状態では理由と可能な次の操作を示す。代表値に単位、人物に識別できる名前を添える。 |
| フィードバック | Notification は操作結果、Loading と Skeleton は待機、Progress bar は既知の進捗、Icon と Shape indicators は状態の補助に使う。 | ライブリージョンは通知の緊急度に応じて選ぶ。進捗は名前と現在値を提供し、インジケーターには説明を添える。 |
| オーバーレイ | Side panel は画面と併用する詳細、Popover と Toggletip は起点の近くに出す補足、Tooltip は短い説明に使う。 | パネルの開閉、初期フォーカス、閉じた後の復帰を確認する。Tooltip には必須情報や操作を置かず、起点のフォーカスでも表示する。 |
| 特殊用途 | AI label は生成物の識別、Edit in place は短い項目の編集、Add select は候補からの追加、Options tile と Action set は選択と確定、Resizer と Scroll gradient は表示領域の調整に使う。 | 保存・キャンセルの結果を明示する。サイズ調整はドラッグとキーボードで操作できるようにし、表示幅の上下限を確認する。 |
