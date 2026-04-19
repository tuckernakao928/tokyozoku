# Claude Code 指示書：週末東京族 コストシミュレーター MVP実装

## 0. 最重要原則

この指示書は**2つの独立したタスク**を含みます：

1. **タスクA：Wikipediaページビュー取得スクリプト**（データ収集）
2. **タスクB：シミュレーターMVP実装**（機能実装・Vercel本番デプロイまで）

**タスクAとタスクBは並行して進めてよい**。タスクA完了後、得られた人気度データをタスクBに組み込む。

すべての実装で `CLAUDE.md` と `SEO.md` を最優先で参照すること。

---

## タスクA：Wikipediaページビュー取得スクリプト

### A-1. 目的

26都市の「人気度（ブランド力）」指標を、Wikipedia日本語版のページビュー数から算出する。
客観データで、完全無料、定期更新可能なスクリプトとして実装する。

### A-2. 成果物

- `scripts/fetch_wiki_views.ts`（または `.py`。Node.js推奨）
- `data/wiki_views.json`（取得結果。26都市分）
- `data/popularity_scores.json`（5段階スコアに正規化した結果）

### A-3. 実装仕様

**取得対象**：26都市のWikipedia日本語版ページビュー数（過去12ヶ月合計）

**対象期間**：2025年4月1日〜2026年3月31日（12ヶ月）

**API**：Wikimedia REST API
```
https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/ja.wikipedia/all-access/user/{title}/monthly/{start}/{end}
```

**必須：User-Agentヘッダー**（Wikimedia規約により連絡先を含めること）
```
User-Agent: tokyozoku-research/1.0 (https://tokyozoku.com; contact@tokyozoku.com)
```

**26都市のWikipedia記事タイトル**（URLエンコード前）：

| 都市 | Wiki記事タイトル |
|---|---|
| 栃木県宇都宮市 | 宇都宮市 |
| 栃木県小山市 | 小山市_(栃木県) |
| 群馬県高崎市 | 高崎市 |
| 群馬県前橋市 | 前橋市 |
| 茨城県水戸市 | 水戸市 |
| 茨城県つくば市 | つくば市 |
| 静岡県静岡市 | 静岡市 |
| 静岡県浜松市 | 浜松市 |
| 静岡県熱海市 | 熱海市 |
| 静岡県三島市 | 三島市 |
| 長野県軽井沢町 | 軽井沢町 |
| 長野県佐久市 | 佐久市 |
| 長野県長野市 | 長野市 |
| 山梨県甲府市 | 甲府市 |
| 山梨県大月市 | 大月市 |
| 福島県郡山市 | 郡山市_(福島県) |
| 宮城県仙台市 | 仙台市 |
| 新潟県越後湯沢 | 湯沢町 |
| 埼玉県秩父市 | 秩父市 |
| 神奈川県小田原市 | 小田原市 |
| 千葉県館山市 | 館山市 |
| 千葉県銚子市 | 銚子市 |
| 茨城県日立市 | 日立市 |
| 山梨県富士吉田市 | 富士吉田市 |
| 栃木県那須塩原市 | 那須塩原市 |
| 群馬県安中市 | 安中市 |

### A-4. 人気度スコアへの変換

12ヶ月合計ビュー数を5段階スコアに正規化する。

**方針**：対数スケールで正規化（ビュー数は都市により桁違いに差があるため、線形だと少数の大都市に引きずられる）

```
log_views = log10(views + 1)
min_log = 26都市の最小log_views
max_log = 26都市の最大log_views
normalized = (log_views - min_log) / (max_log - min_log)  // 0〜1
score_5 = 1 + normalized * 4  // 1〜5
```

出力例：`{ "山梨県大月市": 2.3, "長野県軽井沢町": 4.8, ... }`

### A-5. スクリプトの運用想定

- ローカルで `npm run fetch-wiki-views` または `python scripts/fetch_wiki_views.py` で実行
- 結果はJSONに保存し、`src/data/cities.ts` にインポートして使用
- 半年に1回程度の更新を想定（crontab設定は不要、手動でOK）

### A-6. エラー処理

- ページが見つからない場合：エラーログを出力、`views: null` で記録
- API制限（429）の場合：指数バックオフでリトライ3回
- タイムアウト：10秒で諦めて次の都市へ

---

## タスクB：シミュレーターMVP実装

### B-1. 前提情報

**プロジェクト構成**：
- Next.js（App Router）
- TypeScript
- Vercel本番デプロイ済み
- リポジトリ：tuckernakao928/tokyozoku
- ドメイン：tokyozoku.com

**参照すべきファイル**：
- `CLAUDE.md`（プロジェクト全体の方針）
- `SEO.md`（SEOキーワード戦略）
- `app/page.tsx`（トップページの既存UI・デザイントーン）

**デザイントーン**（既存トップページに準拠）：
- カラー：ウォームホワイト（背景）+ ブラウンゴールド（アクセント）+ ブルー（CTAボタン）
- フォント：システムデフォルト（Anthropic Sans系）
- コンポーネント：白背景カード + 0.5px細ボーダー + 角丸
- レイアウト：シンプル、余白多め、縦長1カラム

### B-2. ルーティング

**URL**: `/simulator`

**ファイル**: `app/simulator/page.tsx`

トップページの既存のCTAボタン「コストを計算してみる」のリンク先をこのURLに設定すること。

### B-3. 入力UI仕様

6つの入力項目を縦に並べる。スライダーは数値表示付き、リアルタイムで結果が更新される。

#### ① 月給スライダー
- 最小値：20万円
- 最大値：100万円
- 初期値：40万円
- ステップ：1万円
- 表示ラベル：「あなたの月給」

#### ② 現在の家賃（東京）スライダー
- 最小値：5万円
- 最大値：25万円
- 初期値：10万円
- ステップ：1万円
- 表示ラベル：「現在の家賃（東京）」

#### ③ 移住先セレクト（最重要UI）
- **初期表示**：TOP10を優先表示（下記B-4参照）
- **「もっと見る」ボタン**：残り16都市を展開表示
- 各都市には市区町村名・都道府県を表示
- デフォルト選択：TOP10の1位（暫定では「山梨県大月市」）

**TOP10リスト（暫定、人気度データ取得後に再計算）**：
1. 山梨県大月市
2. 埼玉県秩父市
3. 山梨県富士吉田市
4. 山梨県甲府市
5. 群馬県安中市
6. 群馬県前橋市
7. 新潟県越後湯沢
8. 栃木県那須塩原市
9. 茨城県水戸市
10. 茨城県日立市

残り16都市は「もっと見る」展開時に表示。

#### ④ 東京への頻度トグル
- 選択肢：月1回 / 月2回 / 月4回 / 週2回
- 初期値：月2回
- 内部値：1 / 2 / 4 / 8（週2回は月8回として計算）

#### ⑤ 宿泊泊数トグル
- 選択肢：日帰り / 1泊 / 2泊 / 3泊以上
- 初期値：日帰り
- 内部値：0 / 1 / 2 / 3

#### ⑥ 1泊あたりの宿泊費スライダー（条件付き表示）
- 泊数が「日帰り」以外のときのみ表示
- 最小値：3,000円
- 最大値：30,000円
- 初期値：8,000円
- ステップ：1,000円

### B-4. 26都市データ

`src/data/cities.ts` に以下の形式で格納する：

```typescript
export type City = {
  id: string;           // スラッグ（例："otsuki"）
  name: string;         // 表示名（例："山梨県大月市"）
  wikiTitle: string;    // Wiki記事タイトル
  travelTime: string;   // 所要時間テキスト
  fare: number;         // 月2回往復交通費（円）
  rent: number;         // 家賃相場（円/月）
  subsidy: number | null; // 移住補助金（円、不明はnull）
  priceIndex: number;   // 物価指数（東京=100）
  leisureText: string;  // レジャー説明
  popularity: number;   // 人気度スコア（1-5、初期値は仮）
};

export const CITIES: City[] = [
  // 26都市分
];
```

**26都市データ全体**：前記引き継ぎ資料のCSVをTypeScriptオブジェクトに変換すること。

### B-5. 計算ロジック

```typescript
const calculate = (input: Input, city: City) => {
  const salary = input.salary * 10000;        // 月給（円）
  const rentTokyo = input.rentTokyo * 10000;  // 東京家賃（円）
  const frequency = input.frequency;           // 月回数
  const nights = input.nights;                 // 泊数
  const hotelRate = input.hotelRate;          // 1泊単価

  const monthlyFare = city.fare / 2 * frequency;  
  // city.fareは月2回前提のため半分に戻して頻度を掛ける

  const monthlyStay = nights * hotelRate * frequency;
  const rentSavingMonthly = rentTokyo - city.rent;

  const yearFare = (monthlyFare + monthlyStay) * 12;
  const yearRentSaving = rentSavingMonthly * 12;
  const subsidy = city.subsidy ?? 0;  // 不明の場合は計算に含めない

  const netAnnual = yearRentSaving - yearFare + subsidy;
  const netMonthly = netAnnual / 12;

  return {
    netAnnual,
    netMonthly,
    yearFare,
    yearRentSaving,
    subsidy,
    monthlyFare,
    monthlyStay,
    rentSavingMonthly,
  };
};
```

**重要**：物価差・レジャー充実度・人気度は**計算には一切使わない**。これらは表示用のみ。

### B-6. 出力UI仕様

#### ① ハイライトボックス（結果の主役）

**netAnnual >= 0 の場合**（プラス）：
- 背景：緑系（例：#f0f9f4）
- 見出し：「移住で生まれる東京のお小遣い（年間）」
- 大きな金額表示：`¥{netAnnual.toLocaleString()}`
- サブテキスト：「月換算：¥{netMonthly.toLocaleString()}」

**netAnnual < 0 の場合**（マイナス）：
- 背景：赤系（例：#fef2f2）
- 見出し：「移住後のコスト増（年間）」
- 大きな金額表示：`¥{Math.abs(netAnnual).toLocaleString()}`
- サブテキスト：「月換算：¥{Math.abs(netMonthly).toLocaleString()}」

#### ② メトリクスカード4分割

2×2グリッドで以下を表示：
1. **年間交通費**：`¥{yearFare.toLocaleString()}`（赤字）
2. **家賃年間差額**：`¥{yearRentSaving.toLocaleString()}`（緑字）
3. **移住補助金**：`¥{subsidy.toLocaleString()}`（緑字、null時は「不明」と表示）
4. **月あたり換算**：`¥{netMonthly.toLocaleString()}`（プラス緑／マイナス赤）

#### ③ 補助情報エリア（MVP新規追加）

メトリクスカードの下に、**物価差・レジャー充実度・人気度**を表示する。これは「計算には使われないが知っておくと役立つ情報」として見せる。

例：
```
📊 {city.name}のその他データ
・物価：東京より約{(100 - city.priceIndex).toFixed(1)}%安い
・レジャー充実度：{city.leisureText}
・人気度：★★★★☆（4/5）
```

#### ④ コメントボックス（条件分岐）

```typescript
const getComment = (netAnnual: number, cityName: string) => {
  if (netAnnual >= 500000) {
    return `${cityName}なら、東京のお小遣いが年間¥${netAnnual.toLocaleString()}生まれます。週末の食事・エンタメ・ショッピングを思い切り楽しめます。`;
  } else if (netAnnual >= 0) {
    return `${cityName}ならほぼ収支トントン。生活コストが下がる分、東京での時間をより豊かに過ごせる可能性があります。`;
  } else {
    return `${cityName}の場合、年間¥${Math.abs(netAnnual).toLocaleString()}のコスト増。訪問頻度を減らすか、家賃の安い都市を選ぶと改善します。`;
  }
};
```

#### ⑤ 内訳セクション

月額の内訳を透明性のある形で表示：
- 月給：`¥{salary.toLocaleString()}`
- 東京家賃：`¥{rentTokyo.toLocaleString()}`
- 移住先家賃：`¥{city.rent.toLocaleString()}`
- 月の交通費：`¥{monthlyFare.toLocaleString()}`
- 月の宿泊費：`¥{monthlyStay.toLocaleString()}`

#### ⑥ アフィリエイト導線（MVP新規追加）

結果画面の下部に、4つのボタンを横並び（モバイルは縦）で配置。

**仮リンクで実装、後で差し替え可能な形にする**：`src/config/affiliates.ts` に以下の形式で管理：

```typescript
export const AFFILIATE_LINKS = {
  train: "https://example.com/train",       // 新幹線予約（えきねっと等）
  hotel: "https://example.com/hotel",       // じゃらん・楽天トラベル
  subscriptionHome: "https://example.com/address", // ADDress等サブスク住居
  movingGoods: "https://example.com/goods", // Amazon移動グッズ
};
```

ボタン例：
- 🚄 新幹線を予約する（えきねっと）
- 🏨 東京の宿を探す（じゃらん）
- 🏠 拠点サブスクを見る（ADDress）
- 🎒 移動を快適にするグッズ

各ボタンは `rel="noopener noreferrer sponsored"` を付与。

#### ⑦ Xシェアボタン

クリックでX（旧Twitter）のシェア画面を開く。

```
【週末東京族シミュレーター】
移住先：{city.name}
月{frequency}回東京に戻る想定
移住で生まれる東京のお小遣い：年間¥{netAnnual}
月換算：¥{netMonthly}

あなたも試してみる → https://tokyozoku.com/simulator
```

### B-7. SEO対応

`app/simulator/page.tsx` に以下のメタデータを設定：

```typescript
export const metadata = {
  title: "【無料】二拠点生活 費用シミュレーション｜週末東京族",
  description: "東京の高家賃を払い続けますか？地方移住 × 週末東京の2拠点生活で、年間いくら浮くかを無料シミュレーション。26都市の家賃・交通費・補助金データをもとに計算します。",
  openGraph: {
    title: "二拠点生活シミュレーター｜週末東京族",
    description: "移住で生まれる東京のお小遣いを計算。",
    url: "https://tokyozoku.com/simulator",
    type: "website",
  },
};
```

**狙うキーワード**（SEO.mdより）：
- 二拠点生活 費用 シミュレーション
- 二拠点生活 交通費 節約
- 東京から2時間 移住

本文中にこれらのキーワードを自然に含めるセクションを入れること（例：シミュレーターの下に「二拠点生活の費用を正しく把握する方法」のような短い解説セクション）。

### B-8. レスポンシブ対応

- モバイルファースト
- スライダーはタッチ操作で動かしやすいサイズ（最小タップ領域44px）
- メトリクスカードはモバイルで1列縦並び、タブレット以上で2×2
- フォントサイズはモバイル16px以上（iOS拡大防止）

### B-9. 実装推奨スタック

- React Hooks（useState）でステート管理
- スライダー：`<input type="range">` をカスタムCSSで装飾、または `react-slider` 等のライブラリ
- アイコン：`lucide-react`
- スタイリング：Tailwind CSS（既存プロジェクトに準拠）
- 外部ライブラリは最小限に

### B-10. Vercel本番デプロイ

実装完了後：
1. GitHub mainブランチにpush
2. Vercelで自動デプロイ（既存接続済み）
3. https://tokyozoku.com/simulator でアクセス可能になることを確認
4. モバイル・デスクトップ両方で動作確認
5. Lighthouse スコア：Performance/Accessibility/Best Practices/SEO すべて90点以上を目標

### B-11. テスト観点

- すべてのスライダーが動作し、リアルタイムで結果が更新される
- 26都市すべてで計算が破綻しない（補助金nullの4都市で計算エラーが起きない）
- 日帰り時は宿泊費スライダーが非表示
- Xシェアボタンから実際にX投稿画面が開く
- 「もっと見る」で残り16都市が展開される

---

## 実装順序の推奨

1. **タスクA** を最初に実行（Wikipediaデータ取得・保存）→ 5分で完了
2. 取得したデータを `src/data/cities.ts` の `popularity` フィールドに反映
3. タスクA結果に基づき、**暫定TOP10を再計算**（人気度も加えた重み付け）
4. **タスクB** のシミュレーターMVP実装
5. ローカルで動作確認
6. GitHub push → Vercel本番デプロイ
7. 本番URLで動作確認

---

## 最終判断はTakashiに相談

以下のような判断が必要な場面では、勝手に決めず、**必ず一度Takashiに確認すること**：

- TOP10選出アルゴリズムの重み付け変更
- デザインの大幅変更（カラー・レイアウト）
- アフィリエイトリンクの具体的な提携先決定
- 新機能の追加（レーダーチャート等）

小さな実装判断（CSSの微調整、変数名等）はClaude Codeの判断で進めてOK。

---

## 完了報告

タスクA・Bともに完了したら、以下を報告すること：

1. 本番URL（tokyozoku.com/simulator）
2. Lighthouseスコア
3. 26都市の人気度スコア一覧
4. 新しい暫定TOP10
5. 未実装で後回しにした機能（あれば）
6. 気づいた改善提案（あれば）
