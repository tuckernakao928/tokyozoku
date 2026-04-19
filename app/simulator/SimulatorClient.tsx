"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CITIES, City } from "@/src/data/cities";
import { AFFILIATE_LINKS } from "@/src/config/affiliates";

const TOP10_COUNT = 10;

const FREQUENCY_OPTIONS = [
  { label: "月1回", value: 1 },
  { label: "月2回", value: 2 },
  { label: "月4回", value: 4 },
  { label: "週2回", value: 8 },
];

const NIGHTS_OPTIONS = [
  { label: "日帰り", value: 0 },
  { label: "1泊", value: 1 },
  { label: "2泊", value: 2 },
  { label: "3泊以上", value: 3 },
];

function calculate(
  salary: number,
  rentTokyo: number,
  frequency: number,
  nights: number,
  hotelRate: number,
  city: City
) {
  const salaryYen = salary * 10000;
  const rentTokyoYen = rentTokyo * 10000;
  const monthlyFare = (city.fare / 2) * frequency;
  const monthlyStay = nights * hotelRate * frequency;
  const rentSavingMonthly = rentTokyoYen - city.rent;
  const yearFare = (monthlyFare + monthlyStay) * 12;
  const yearRentSaving = rentSavingMonthly * 12;
  const subsidy = city.subsidy ?? 0;
  const netAnnual = yearRentSaving - yearFare + subsidy;
  const netMonthly = Math.round(netAnnual / 12);

  return {
    salaryYen,
    rentTokyoYen,
    monthlyFare,
    monthlyStay,
    rentSavingMonthly,
    yearFare,
    yearRentSaving,
    subsidy,
    netAnnual,
    netMonthly,
  };
}

function getComment(netAnnual: number, cityName: string): string {
  if (netAnnual >= 500000) {
    return `${cityName}なら、東京のお小遣いが年間¥${netAnnual.toLocaleString()}生まれます。週末の食事・エンタメ・ショッピングを思い切り楽しめます。`;
  } else if (netAnnual >= 0) {
    return `${cityName}ならほぼ収支トントン。生活コストが下がる分、東京での時間をより豊かに過ごせる可能性があります。`;
  } else {
    return `${cityName}の場合、年間¥${Math.abs(netAnnual).toLocaleString()}のコスト増。訪問頻度を減らすか、家賃の安い都市を選ぶと改善します。`;
  }
}

function getStars(score: number): string {
  const rounded = Math.round(score);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
        <span className="text-lg font-bold text-[#1A1A1A]">{display}</span>
      </div>
      <div className="py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

function ToggleGroup<T extends number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
      <div className="flex rounded-lg border border-[#E5E2DC] overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              value === opt.value
                ? "bg-[#1A1A1A] text-white"
                : "bg-white text-[#6B7280] hover:bg-[#F5F2EC]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "red" | "green" | "auto";
}) {
  const colorClass =
    color === "red"
      ? "text-red-600"
      : color === "green"
      ? "text-emerald-600"
      : "";
  return (
    <div className="bg-white border border-[#E5E2DC] rounded-xl p-4">
      <p className="text-xs text-[#6B7280] mb-1">{label}</p>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

export default function SimulatorClient() {
  const [salary, setSalary] = useState(40);
  const [rentTokyo, setRentTokyo] = useState(10);
  const [selectedCityId, setSelectedCityId] = useState("otsuki");
  const [frequency, setFrequency] = useState<1 | 2 | 4 | 8>(2);
  const [nights, setNights] = useState<0 | 1 | 2 | 3>(0);
  const [hotelRate, setHotelRate] = useState(8000);
  const [showAllCities, setShowAllCities] = useState(false);

  const city = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0],
    [selectedCityId]
  );

  const result = useMemo(
    () => calculate(salary, rentTokyo, frequency, nights, hotelRate, city),
    [salary, rentTokyo, frequency, nights, hotelRate, city]
  );

  const displayedCities = showAllCities ? CITIES : CITIES.slice(0, TOP10_COUNT);

  const isPositive = result.netAnnual >= 0;

  const shareText = `【週末東京族シミュレーター】\n移住先：${city.name}\n月${frequency}回東京に戻る想定\n移住で生まれる東京のお小遣い：年間¥${result.netAnnual.toLocaleString()}\n月換算：¥${result.netMonthly.toLocaleString()}\n\nあなたも試してみる → https://tokyozoku.com/simulator`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-sm border-b border-[#E5E2DC]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            週末東京族
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-[#6B7280]">
            <Link href="/simulator" className="text-[#1A1A1A] font-medium">
              コストシミュレーター
            </Link>
            <Link href="/ranking" className="hover:text-[#1A1A1A] transition-colors">
              移住先ランキング
            </Link>
            <Link href="/items" className="hover:text-[#1A1A1A] transition-colors">
              移動グッズ
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-[#FAFAF8]">
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
          {/* Page heading */}
          <div>
            <p className="text-xs font-medium tracking-[0.2em] text-[#8C6D46] uppercase mb-3">
              Cost Simulator
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              二拠点生活
              <br />
              費用シミュレーター
            </h1>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              移住先の家賃・交通費・補助金データをもとに、
              二拠点生活でいくら節約できるかを無料でシミュレーション。
              26都市を比較できます。
            </p>
          </div>

          {/* ====== Inputs ====== */}
          <div className="bg-white border border-[#E5E2DC] rounded-2xl p-6 space-y-8">
            <SliderRow
              label="あなたの月給"
              value={salary}
              min={20}
              max={100}
              step={1}
              display={`${salary}万円`}
              onChange={setSalary}
            />

            <SliderRow
              label="現在の家賃（東京）"
              value={rentTokyo}
              min={5}
              max={25}
              step={1}
              display={`${rentTokyo}万円`}
              onChange={setRentTokyo}
            />

            {/* City selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#1A1A1A]">
                移住先を選ぶ
                {!showAllCities && (
                  <span className="ml-2 text-xs text-[#8C6D46] font-normal">
                    コスパTOP10
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {displayedCities.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCityId(c.id)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      selectedCityId === c.id
                        ? "border-[#1A1A1A] bg-[#1A1A1A] text-white font-medium"
                        : "border-[#E5E2DC] bg-white text-[#1A1A1A] hover:border-[#8C6D46]"
                    }`}
                  >
                    {!showAllCities && i < TOP10_COUNT && (
                      <span
                        className={`text-xs mr-1 ${
                          selectedCityId === c.id
                            ? "text-[#C8A96E]"
                            : "text-[#8C6D46]"
                        }`}
                      >
                        {i + 1}.
                      </span>
                    )}
                    {c.name}
                  </button>
                ))}
              </div>
              {!showAllCities && (
                <button
                  onClick={() => setShowAllCities(true)}
                  className="w-full py-2.5 text-sm text-[#6B7280] border border-[#E5E2DC] rounded-lg hover:border-[#8C6D46] hover:text-[#8C6D46] transition-colors"
                >
                  もっと見る（残り{CITIES.length - TOP10_COUNT}都市）
                </button>
              )}
            </div>

            <ToggleGroup
              label="東京への頻度"
              options={FREQUENCY_OPTIONS as { label: string; value: 1 | 2 | 4 | 8 }[]}
              value={frequency}
              onChange={setFrequency}
            />

            <ToggleGroup
              label="宿泊泊数"
              options={NIGHTS_OPTIONS as { label: string; value: 0 | 1 | 2 | 3 }[]}
              value={nights}
              onChange={setNights}
            />

            {nights > 0 && (
              <SliderRow
                label="1泊あたりの宿泊費"
                value={hotelRate}
                min={3000}
                max={30000}
                step={1000}
                display={`¥${hotelRate.toLocaleString()}`}
                onChange={setHotelRate}
              />
            )}
          </div>

          {/* ====== Results ====== */}
          <div className="space-y-4">
            {/* Highlight box */}
            <div
              className={`rounded-2xl p-6 ${
                isPositive ? "bg-[#f0f9f4]" : "bg-[#fef2f2]"
              }`}
            >
              <p className="text-sm font-medium text-[#6B7280] mb-2">
                {isPositive
                  ? "移住で生まれる東京のお小遣い（年間）"
                  : "移住後のコスト増（年間）"}
              </p>
              <p
                className={`text-4xl sm:text-5xl font-bold tracking-tight mb-1 ${
                  isPositive ? "text-emerald-700" : "text-red-600"
                }`}
              >
                ¥{Math.abs(result.netAnnual).toLocaleString()}
              </p>
              <p className="text-sm text-[#6B7280]">
                月換算：¥{Math.abs(result.netMonthly).toLocaleString()}
              </p>
            </div>

            {/* 4-grid metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="年間交通費"
                value={`¥${result.yearFare.toLocaleString()}`}
                color="red"
              />
              <MetricCard
                label="家賃年間差額"
                value={`¥${result.yearRentSaving.toLocaleString()}`}
                color="green"
              />
              <MetricCard
                label="移住補助金"
                value={
                  city.subsidy !== null
                    ? `¥${city.subsidy.toLocaleString()}`
                    : "不明"
                }
                color="green"
              />
              <MetricCard
                label="月あたり換算"
                value={`¥${Math.abs(result.netMonthly).toLocaleString()}`}
                color={isPositive ? "green" : "red"}
              />
            </div>

            {/* Supplementary info */}
            <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5 space-y-2">
              <p className="text-sm font-medium text-[#1A1A1A] mb-3">
                📊 {city.name}のその他データ
              </p>
              <p className="text-sm text-[#6B7280]">
                ・物価：東京より約{(100 - city.priceIndex).toFixed(1)}%安い
              </p>
              <p className="text-sm text-[#6B7280]">
                ・レジャー充実度：{city.leisureText}
              </p>
              <p className="text-sm text-[#6B7280]">
                ・人気度：{getStars(city.popularity)}（{city.popularity}/5）
              </p>
              <p className="text-sm text-[#6B7280]">
                ・所要時間：{city.travelTime}
              </p>
            </div>

            {/* Comment */}
            <div className="bg-[#F5F2EC] rounded-2xl p-5">
              <p className="text-sm text-[#1A1A1A] leading-relaxed">
                {getComment(result.netAnnual, city.name)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5">
              <p className="text-sm font-medium text-[#1A1A1A] mb-4">月額内訳</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[#6B7280]">
                  <span>月給</span>
                  <span className="font-medium text-[#1A1A1A]">
                    ¥{result.salaryYen.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>東京家賃（現在）</span>
                  <span className="font-medium text-red-500">
                    −¥{result.rentTokyoYen.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>移住先家賃</span>
                  <span className="font-medium text-emerald-600">
                    −¥{city.rent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>月の交通費（東京往復）</span>
                  <span className="font-medium text-red-500">
                    −¥{Math.round(result.monthlyFare).toLocaleString()}
                  </span>
                </div>
                {result.monthlyStay > 0 && (
                  <div className="flex justify-between text-[#6B7280]">
                    <span>月の宿泊費</span>
                    <span className="font-medium text-red-500">
                      −¥{Math.round(result.monthlyStay).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-[#E5E2DC] pt-2.5 flex justify-between">
                  <span className="font-medium text-[#1A1A1A]">
                    月間家賃差額
                  </span>
                  <span
                    className={`font-bold ${
                      result.rentSavingMonthly >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {result.rentSavingMonthly >= 0 ? "+" : ""}¥
                    {result.rentSavingMonthly.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Affiliate links */}
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-widest text-[#8C6D46] uppercase">
                次のアクション
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={AFFILIATE_LINKS.train}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E2DC] rounded-xl text-sm font-medium hover:border-[#C8A96E] transition-colors"
                >
                  <span className="text-xl">🚄</span>
                  <span>新幹線を予約する（えきねっと）</span>
                </a>
                <a
                  href={AFFILIATE_LINKS.hotel}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E2DC] rounded-xl text-sm font-medium hover:border-[#C8A96E] transition-colors"
                >
                  <span className="text-xl">🏨</span>
                  <span>東京の宿を探す（じゃらん）</span>
                </a>
                <a
                  href={AFFILIATE_LINKS.subscriptionHome}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E2DC] rounded-xl text-sm font-medium hover:border-[#C8A96E] transition-colors"
                >
                  <span className="text-xl">🏠</span>
                  <span>拠点サブスクを見る（ADDress）</span>
                </a>
                <a
                  href={AFFILIATE_LINKS.movingGoods}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E2DC] rounded-xl text-sm font-medium hover:border-[#C8A96E] transition-colors"
                >
                  <span className="text-xl">🎒</span>
                  <span>移動を快適にするグッズ</span>
                </a>
              </div>
            </div>

            {/* X share button */}
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-xl hover:bg-[#333] transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
              シミュレーション結果をXでシェア
            </a>
          </div>

          {/* SEO text section */}
          <div className="border-t border-[#E5E2DC] pt-10 space-y-4">
            <h2 className="text-xl font-bold">
              二拠点生活の費用を正しく把握する方法
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              二拠点生活の費用シミュレーションで多くの人が見落とすのは、「交通費 × 頻度」の合計です。
              東京から2時間圏内の移住先であれば、新幹線代は月2〜4回で年間10〜30万円程度。
              一方で地方移住による家賃節約効果は年間30〜60万円になることも。
              二拠点生活 交通費 節約の観点では、移住先を東京に近い場所に選ぶほど節約効果が大きくなります。
            </p>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              このシミュレーターは、東京から2時間以内でアクセスできる26都市の実際の家賃相場・交通費・
              移住補助金データをもとに計算しています。
              「二拠点生活 費用 シミュレーション」として26都市を横断比較できるツールは
              国内でも珍しく、自治体の補助金まで含めた実質コストを把握できます。
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2DC] bg-[#F5F2EC]">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-bold text-sm mb-1">週末東京族</p>
            <p className="text-xs text-[#6B7280]">地方に住む。東京を使う。</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#6B7280]">
            <Link href="/about" className="hover:text-[#1A1A1A] transition-colors">
              このサイトについて
            </Link>
            <Link href="/simulator" className="hover:text-[#1A1A1A] transition-colors">
              コストシミュレーター
            </Link>
            <Link href="/ranking" className="hover:text-[#1A1A1A] transition-colors">
              移住先ランキング
            </Link>
            <Link href="/privacy" className="hover:text-[#1A1A1A] transition-colors">
              プライバシーポリシー
            </Link>
          </nav>
          <p className="text-xs text-[#6B7280]">© 2024 週末東京族</p>
        </div>
      </footer>
    </div>
  );
}
