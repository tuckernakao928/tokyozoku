import { writeFileSync } from "fs";
import { join } from "path";

const USER_AGENT =
  "tokyozoku-research/1.0 (https://tokyozoku.com; contact@tokyozoku.com)";

const START = "20250401";
const END = "20260331";

const CITIES = [
  { name: "栃木県宇都宮市", wikiTitle: "宇都宮市" },
  { name: "栃木県小山市", wikiTitle: "小山市" },
  { name: "群馬県高崎市", wikiTitle: "高崎市" },
  { name: "群馬県前橋市", wikiTitle: "前橋市" },
  { name: "茨城県水戸市", wikiTitle: "水戸市" },
  { name: "茨城県つくば市", wikiTitle: "つくば市" },
  { name: "静岡県静岡市", wikiTitle: "静岡市" },
  { name: "静岡県浜松市", wikiTitle: "浜松市" },
  { name: "静岡県熱海市", wikiTitle: "熱海市" },
  { name: "静岡県三島市", wikiTitle: "三島市" },
  { name: "長野県軽井沢町", wikiTitle: "軽井沢町" },
  { name: "長野県佐久市", wikiTitle: "佐久市" },
  { name: "長野県長野市", wikiTitle: "長野市" },
  { name: "山梨県甲府市", wikiTitle: "甲府市" },
  { name: "山梨県大月市", wikiTitle: "大月市" },
  { name: "福島県郡山市", wikiTitle: "郡山市" },
  { name: "宮城県仙台市", wikiTitle: "仙台市" },
  { name: "新潟県越後湯沢", wikiTitle: "湯沢町" },
  { name: "埼玉県秩父市", wikiTitle: "秩父市" },
  { name: "神奈川県小田原市", wikiTitle: "小田原市" },
  { name: "千葉県館山市", wikiTitle: "館山市" },
  { name: "千葉県銚子市", wikiTitle: "銚子市" },
  { name: "茨城県日立市", wikiTitle: "日立市" },
  { name: "山梨県富士吉田市", wikiTitle: "富士吉田市" },
  { name: "栃木県那須塩原市", wikiTitle: "那須塩原市" },
  { name: "群馬県安中市", wikiTitle: "安中市" },
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.status === 429) {
        const wait = Math.pow(2, attempt + 1) * 1000;
        console.log(`429 received, retrying in ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries - 1) throw err;
      const wait = Math.pow(2, attempt + 1) * 1000;
      console.log(`Error, retrying in ${wait}ms...`);
      await sleep(wait);
    }
  }
  throw new Error("Max retries exceeded");
}

async function fetchViews(wikiTitle: string): Promise<number | null> {
  const encoded = encodeURIComponent(wikiTitle);
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/ja.wikipedia/all-access/user/${encoded}/monthly/${START}/${END}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${wikiTitle}`);
      return null;
    }
    const json = await res.json();
    const total = (json.items as { views: number }[]).reduce(
      (sum, item) => sum + item.views,
      0
    );
    return total;
  } catch (err) {
    console.error(`  TIMEOUT/ERROR for ${wikiTitle}:`, err);
    return null;
  }
}

function normalizeToScore(viewsMap: Record<string, number | null>): Record<string, number | null> {
  const validEntries = Object.entries(viewsMap).filter(
    ([, v]) => v !== null
  ) as [string, number][];

  const logViews = validEntries.map(([name, v]) => ({
    name,
    log: Math.log10(v + 1),
  }));

  const minLog = Math.min(...logViews.map((x) => x.log));
  const maxLog = Math.max(...logViews.map((x) => x.log));

  const scores: Record<string, number | null> = {};
  for (const [name, v] of Object.entries(viewsMap)) {
    if (v === null) {
      scores[name] = null;
    } else {
      const log = Math.log10(v + 1);
      const normalized = (log - minLog) / (maxLog - minLog);
      const score = 1 + normalized * 4;
      scores[name] = Math.round(score * 10) / 10;
    }
  }
  return scores;
}

async function main() {
  console.log("Wikipedia ページビュー取得開始...\n");

  const wikiViews: Record<string, number | null> = {};

  for (const city of CITIES) {
    process.stdout.write(`  ${city.name} (${city.wikiTitle})... `);
    const views = await fetchViews(city.wikiTitle);
    wikiViews[city.name] = views;
    console.log(views !== null ? views.toLocaleString() : "null");
    await sleep(200);
  }

  const outDir = join(process.cwd(), "data");
  const { mkdirSync } = await import("fs");
  mkdirSync(outDir, { recursive: true });

  writeFileSync(
    join(outDir, "wiki_views.json"),
    JSON.stringify(wikiViews, null, 2),
    "utf-8"
  );
  console.log("\nwiki_views.json を保存しました");

  const popularityScores = normalizeToScore(wikiViews);
  writeFileSync(
    join(outDir, "popularity_scores.json"),
    JSON.stringify(popularityScores, null, 2),
    "utf-8"
  );
  console.log("popularity_scores.json を保存しました");

  console.log("\n--- 人気度スコア一覧 ---");
  const sorted = Object.entries(popularityScores).sort(
    ([, a], [, b]) => (b ?? 0) - (a ?? 0)
  );
  sorted.forEach(([name, score]) => {
    console.log(`  ${name}: ${score ?? "null"}`);
  });
}

main().catch(console.error);
