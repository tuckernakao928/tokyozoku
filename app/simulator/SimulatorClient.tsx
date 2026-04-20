"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CITIES, City, LeisureTag } from "@/src/data/cities";
import { AFFILIATE_LINKS } from "@/src/config/affiliates";

type Step = 1 | 2 | 3;
type Mode = "cost" | "time" | "leisure" | "recommended";

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

const LEISURE_TAG_OPTIONS: { emoji: string; tag: LeisureTag }[] = [
  { emoji: "🏔", tag: "山・自然" },
  { emoji: "🎿", tag: "スキー" },
  { emoji: "🌊", tag: "海・釣り" },
  { emoji: "🏯", tag: "観光地" },
  { emoji: "🛣", tag: "道の駅" },
];

const RECOMMENDED_GROUPS = [
  { emoji: "💰", label: "補助金が手厚い", ids: ["otsuki", "chichibu", "annaka"] },
  { emoji: "🏠", label: "とにかく家賃が安い", ids: ["annaka", "otsuki", "choshi"] },
  { emoji: "🚄", label: "東京から近いのに安い", ids: ["oyama", "otsuki", "chichibu"] },
  { emoji: "🍜", label: "何でも美味い", ids: ["sendai", "hamamatsu", "kofu"] },
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

function fmt(n: number) {
  return `¥${Math.abs(n).toLocaleString()}`;
}

function getStars(score: number): string {
  const rounded = Math.round(score);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function SliderRow({
  label, value, min, max, step, display, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; display: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-[#1A1A1A]">{label}</label>
        <span className="text-lg font-bold text-[#1A1A1A]">{display}</span>
      </div>
      <div className="py-2">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}

function ToggleGroup<T extends number>({
  label, options, value, onChange,
}: {
  label: string; options: { label: string; value: T }[];
  value: T; onChange: (v: T) => void;
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

export default function SimulatorClient() {
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<Mode>("cost");
  const [salary, setSalary] = useState(33);
  const [rentTokyo, setRentTokyo] = useState(7);
  const [frequency, setFrequency] = useState<1 | 2 | 4 | 8>(2);
  const [nights, setNights] = useState<0 | 1 | 2 | 3>(0);
  const [hotelRate, setHotelRate] = useState(8000);
  const [selectedCityId, setSelectedCityId] = useState<string>("otsuki");

  // STEP2 cost filters
  const [filterSubsidy, setFilterSubsidy] = useState<"all" | "yes">("all");
  const [filterTime, setFilterTime] = useState<"all" | "60" | "90" | "120">("all");
  const [filterRent, setFilterRent] = useState<"all" | "50000" | "70000" | "100000">("all");
  // STEP2 time mode
  const [filterTimeMode, setFilterTimeMode] = useState<"60" | "90" | "120">("90");
  // STEP2 leisure mode
  const [selectedLeisureTags, setSelectedLeisureTags] = useState<LeisureTag[]>([]);

  const city = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0],
    [selectedCityId]
  );

  const result = useMemo(
    () => calculate(salary, rentTokyo, frequency, nights, hotelRate, city),
    [salary, rentTokyo, frequency, nights, hotelRate, city]
  );

  const calcForCity = (c: City) =>
    calculate(salary, rentTokyo, frequency, nights, hotelRate, c);

  const costFilteredCities = useMemo(() => {
    let cities = [...CITIES];
    if (filterSubsidy === "yes") cities = cities.filter((c) => c.subsidy !== null);
    if (filterTime !== "all") cities = cities.filter((c) => c.travelMinutes <= Number(filterTime));
    if (filterRent !== "all") cities = cities.filter((c) => c.rent <= Number(filterRent));
    return cities.sort(
      (a, b) => calcForCity(b).netMonthly - calcForCity(a).netMonthly
    );
  }, [filterSubsidy, filterTime, filterRent, salary, rentTokyo, frequency, nights, hotelRate]);

  const timeFilteredCities = useMemo(
    () =>
      CITIES.filter((c) => c.travelMinutes <= Number(filterTimeMode)).sort(
        (a, b) => a.travelMinutes - b.travelMinutes
      ),
    [filterTimeMode]
  );

  const leisureFilteredCities = useMemo(() => {
    if (selectedLeisureTags.length === 0) return CITIES;
    return CITIES.filter((c) =>
      selectedLeisureTags.some((tag) => c.leisureTags.includes(tag))
    );
  }, [selectedLeisureTags]);

  const goToStep3 = (cityId: string) => {
    setSelectedCityId(cityId);
    setStep(3);
  };

  const shareText = `【週末東京族シミュレーター】\n移住先：${city.name}\n月${frequency}回東京に戻る想定\n移住で生まれる東京のお小遣い：年間${fmt(result.netAnnual)}\n月換算：${fmt(result.netMonthly)}\n\nあなたも試してみる → https://tokyozoku.com/simulator`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  const CityRow = ({ c, rank }: { c: City; rank?: number }) => {
    const r = calcForCity(c);
    return (
      <button
        onClick={() => goToStep3(c.id)}
        className="w-full text-left px-4 py-3 bg-white border border-[#E5E2DC] rounded-xl hover:border-[#8C6D46] transition-colors flex items-center gap-3"
      >
        {rank !== undefined && (
          <span className="text-xs font-bold text-[#8C6D46] w-5 shrink-0">{rank}</span>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-[#1A1A1A]">{c.name}</span>
          <span className="ml-2 text-xs text-[#6B7280]">{c.travelTime}</span>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-[#6B7280]">家賃 {fmt(c.rent)}</div>
          <div
            className={`text-sm font-bold ${
              r.netMonthly >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {r.netMonthly >= 0 ? "+" : "-"}{fmt(r.netMonthly)}/月
          </div>
        </div>
      </button>
    );
  };

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
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

          {/* ====== STEP 1 ====== */}
          {step === 1 && (
            <>
              <div>
                <p className="text-xs font-medium tracking-[0.2em] text-[#8C6D46] uppercase mb-3">
                  Cost Simulator
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                  二拠点生活
                  <br />
                  コストシミュレーター
                </h1>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  東京の家賃と移住先の家賃・交通費・補助金を比較して、二拠点生活でいくら節約できるかを無料でシミュレーション。26都市を横断比較できます。
                </p>
              </div>

              <div className="bg-white border border-[#E5E2DC] rounded-2xl p-6 space-y-8">
                <SliderRow
                  label="あなたの月給" value={salary} min={20} max={100} step={1}
                  display={`${salary}万円`} onChange={setSalary}
                />
                <SliderRow
                  label="現在の家賃（東京）" value={rentTokyo} min={5} max={25} step={1}
                  display={`${rentTokyo}万円`} onChange={setRentTokyo}
                />
                <ToggleGroup
                  label="東京への頻度"
                  options={FREQUENCY_OPTIONS as { label: string; value: 1 | 2 | 4 | 8 }[]}
                  value={frequency} onChange={setFrequency}
                />
                <ToggleGroup
                  label="宿泊泊数"
                  options={NIGHTS_OPTIONS as { label: string; value: 0 | 1 | 2 | 3 }[]}
                  value={nights} onChange={setNights}
                />
                {nights > 0 && (
                  <SliderRow
                    label="1泊あたりの宿泊費" value={hotelRate} min={3000} max={30000} step={1000}
                    display={`¥${hotelRate.toLocaleString()}`} onChange={setHotelRate}
                  />
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-[#1A1A1A]">移住先を選ぶ</p>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { mode: "cost" as Mode, emoji: "💰", label: "コスパで選ぶ" },
                      { mode: "time" as Mode, emoji: "🚄", label: "移動時間で選ぶ" },
                      { mode: "leisure" as Mode, emoji: "🏔", label: "レジャーで選ぶ" },
                      { mode: "recommended" as Mode, emoji: "✨", label: "オススメから選ぶ" },
                    ] as const
                  ).map(({ mode: m, emoji, label }) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setStep(2); }}
                      className="flex flex-col items-center gap-2 px-4 py-5 bg-white border border-[#E5E2DC] rounded-2xl hover:border-[#8C6D46] hover:bg-[#F5F2EC] transition-colors"
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-sm font-medium text-[#1A1A1A]">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ====== STEP 2 ====== */}
          {step === 2 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              >
                ← 条件入力に戻る
              </button>

              {/* コスパで選ぶ */}
              {mode === "cost" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">💰 コスパで選ぶ</h2>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-[#6B7280] block mb-1">補助金</label>
                      <select
                        value={filterSubsidy}
                        onChange={(e) => setFilterSubsidy(e.target.value as "all" | "yes")}
                        className="w-full text-sm border border-[#E5E2DC] rounded-lg px-2 py-2 bg-white"
                      >
                        <option value="all">すべて</option>
                        <option value="yes">補助金あり</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#6B7280] block mb-1">所要時間</label>
                      <select
                        value={filterTime}
                        onChange={(e) => setFilterTime(e.target.value as "all" | "60" | "90" | "120")}
                        className="w-full text-sm border border-[#E5E2DC] rounded-lg px-2 py-2 bg-white"
                      >
                        <option value="all">すべて</option>
                        <option value="60">1時間以内</option>
                        <option value="90">1.5時間以内</option>
                        <option value="120">2時間以内</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#6B7280] block mb-1">家賃上限</label>
                      <select
                        value={filterRent}
                        onChange={(e) => setFilterRent(e.target.value as "all" | "50000" | "70000" | "100000")}
                        className="w-full text-sm border border-[#E5E2DC] rounded-lg px-2 py-2 bg-white"
                      >
                        <option value="all">すべて</option>
                        <option value="50000">〜5万円</option>
                        <option value="70000">〜7万円</option>
                        <option value="100000">〜10万円</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {costFilteredCities.map((c, i) => (
                      <CityRow key={c.id} c={c} rank={i + 1} />
                    ))}
                    {costFilteredCities.length === 0 && (
                      <p className="text-sm text-[#6B7280] text-center py-8">
                        条件に合う都市がありません
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 移動時間で選ぶ */}
              {mode === "time" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">🚄 移動時間で選ぶ</h2>
                  <div className="flex rounded-lg border border-[#E5E2DC] overflow-hidden">
                    {(["60", "90", "120"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterTimeMode(t)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          filterTimeMode === t
                            ? "bg-[#1A1A1A] text-white"
                            : "bg-white text-[#6B7280] hover:bg-[#F5F2EC]"
                        }`}
                      >
                        {t === "60" ? "1時間以内" : t === "90" ? "1.5時間以内" : "2時間以内"}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {timeFilteredCities.map((c) => (
                      <CityRow key={c.id} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* レジャーで選ぶ */}
              {mode === "leisure" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">🏔 レジャーで選ぶ</h2>
                  <div className="flex flex-wrap gap-2">
                    {LEISURE_TAG_OPTIONS.map(({ emoji, tag }) => (
                      <button
                        key={tag}
                        onClick={() =>
                          setSelectedLeisureTags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag]
                          )
                        }
                        className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                          selectedLeisureTags.includes(tag)
                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                            : "bg-white text-[#1A1A1A] border-[#E5E2DC] hover:border-[#8C6D46]"
                        }`}
                      >
                        {emoji} {tag}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {leisureFilteredCities.map((c) => (
                      <CityRow key={c.id} c={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* オススメから選ぶ */}
              {mode === "recommended" && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold">✨ オススメから選ぶ</h2>
                  <div className="space-y-4">
                    {RECOMMENDED_GROUPS.map((group) => (
                      <div
                        key={group.label}
                        className="bg-white border border-[#E5E2DC] rounded-2xl p-4 space-y-3"
                      >
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {group.emoji} {group.label}
                        </p>
                        <div className="space-y-2">
                          {group.ids.map((id) => {
                            const c = CITIES.find((city) => city.id === id);
                            if (!c) return null;
                            return <CityRow key={c.id} c={c} />;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====== STEP 3 ====== */}
          {step === 3 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
              >
                ← 移住先選択に戻る
              </button>

              {/* ① メインヒーロー */}
              <div
                className={`rounded-2xl p-6 ${
                  result.netAnnual >= 0 ? "bg-[#f0f9f4]" : "bg-[#fef2f2]"
                }`}
              >
                <p className="text-lg font-bold text-[#1A1A1A] mb-3">{city.name}</p>
                <p
                  className={`text-3xl sm:text-4xl font-bold tracking-tight mb-2 ${
                    result.netAnnual >= 0 ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {result.netAnnual >= 0
                    ? `年間 ¥${result.netAnnual.toLocaleString()} の余裕が生まれます`
                    : `年間 ¥${Math.abs(result.netAnnual).toLocaleString()} のコスト増になります`}
                </p>
                {result.netAnnual >= 0 && (
                  <p className="text-sm text-[#6B7280]">東京でのお小遣いとして使える金額です</p>
                )}
              </div>

              {/* ② 4つのメトリクスカード */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-[#E5E2DC] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">年間交通費</p>
                  <p className="text-lg font-bold text-red-600">{fmt(result.yearFare)}</p>
                  <p className="text-xs text-[#6B7280] mt-1">週末東京へ行くための交通費</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    月{frequency}回×往復¥{Math.round(city.fare / 2).toLocaleString()}×12ヶ月
                    {nights > 0 ? `＋宿泊費` : ""}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E2DC] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">家賃年間差額</p>
                  <p className="text-lg font-bold text-emerald-600">{fmt(result.yearRentSaving)}</p>
                  <p className="text-xs text-[#6B7280] mt-1">東京家賃との年間差額</p>
                </div>
                <div className="bg-white border border-[#E5E2DC] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">移住補助金</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {city.subsidy !== null ? fmt(city.subsidy) : "要確認"}
                  </p>
                </div>
                <div className="bg-white border border-[#E5E2DC] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">月あたり換算</p>
                  <p
                    className={`text-lg font-bold ${
                      result.netMonthly >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {result.netMonthly >= 0 ? "+" : "-"}{fmt(result.netMonthly)}
                  </p>
                </div>
              </div>

              {/* ③ 月額内訳（修正済み：合計はnetMonthlyを使用） */}
              <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5">
                <p className="text-sm font-medium text-[#1A1A1A] mb-4">月額内訳</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>月給</span>
                    <span className="font-medium text-[#1A1A1A]">
                      {fmt(result.salaryYen)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>東京家賃（現在）</span>
                    <span className="font-medium text-red-500">
                      −{fmt(result.rentTokyoYen)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>移住先家賃</span>
                    <span className="font-medium text-emerald-600">
                      −{fmt(city.rent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>月の交通費（東京往復）</span>
                    <span className="font-medium text-red-500">
                      −{fmt(Math.round(result.monthlyFare))}
                    </span>
                  </div>
                  {result.monthlyStay > 0 && (
                    <div className="flex justify-between text-[#6B7280]">
                      <span>月の宿泊費</span>
                      <span className="font-medium text-red-500">
                        −{fmt(Math.round(result.monthlyStay))}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[#E5E2DC] pt-2.5 flex justify-between">
                    <span className="font-medium text-[#1A1A1A]">月間収支差額</span>
                    <span
                      className={`font-bold ${
                        result.netMonthly >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {result.netMonthly >= 0 ? "+" : "-"}{fmt(result.netMonthly)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ④ 家賃比較表 */}
              <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5">
                <p className="text-sm font-medium text-[#1A1A1A] mb-4">家賃比較</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[#6B7280] text-xs">
                      <th className="text-left pb-2"></th>
                      <th className="text-right pb-2">東京（現在）</th>
                      <th className="text-right pb-2">{city.name.replace(/.*[都道府県]/, "")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F2EC]">
                    <tr>
                      <td className="py-2 text-[#6B7280]">月額家賃</td>
                      <td className="py-2 text-right font-medium">{fmt(result.rentTokyoYen)}</td>
                      <td className="py-2 text-right font-medium text-emerald-600">
                        {fmt(city.rent)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#6B7280]">年間家賃</td>
                      <td className="py-2 text-right font-medium">
                        {fmt(result.rentTokyoYen * 12)}
                      </td>
                      <td className="py-2 text-right font-medium text-emerald-600">
                        {fmt(city.rent * 12)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-[#6B7280]">差額</td>
                      <td className="py-2 text-right text-[#6B7280]">−</td>
                      <td className="py-2 text-right font-bold text-emerald-600">
                        {result.yearRentSaving > 0
                          ? `¥${result.yearRentSaving.toLocaleString()}お得`
                          : fmt(result.yearRentSaving)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ⑤ 都市概要 */}
              <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5 space-y-3">
                <p className="text-sm font-medium text-[#1A1A1A]">{city.name}について</p>
                <p className="text-sm text-[#6B7280] leading-relaxed">{city.overview}</p>
                <div className="flex flex-wrap gap-2">
                  {city.overviewTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#F5F2EC] text-[#8C6D46] px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* ⑥ その他データ */}
              <div className="bg-white border border-[#E5E2DC] rounded-2xl p-5 space-y-2">
                <p className="text-sm font-medium text-[#1A1A1A] mb-3">
                  📊 {city.name}のその他データ
                </p>
                <p className="text-sm text-[#6B7280]">
                  ・物価：{
                    city.priceIndex < 99
                      ? `東京より約${(100 - city.priceIndex).toFixed(1)}%安い`
                      : city.priceIndex > 101
                      ? `東京より約${(city.priceIndex - 100).toFixed(1)}%高い`
                      : `東京とほぼ同じ`
                  }
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

              {/* ⑦ LINE登録ボタン */}
              <a
                href="https://lin.ee/XXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-[#06C755] text-white text-sm font-bold rounded-xl hover:bg-[#05a847] transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                移住情報をLINEで受け取る
              </a>

              {/* ⑧ アフィリエイトリンク */}
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

              {/* ⑨ Xシェアボタン */}
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

              {/* SEOテキスト */}
              <div className="border-t border-[#E5E2DC] pt-10 space-y-4">
                <h2 className="text-xl font-bold">
                  二拠点生活の費用を正しく把握する方法
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  二拠点生活の費用シミュレーションで多くの人が見落とすのは、「交通費 × 頻度」の合計です。
                  東京から2時間圏内の移住先であれば、新幹線代は月2〜4回で年間10〜30万円程度。
                  一方で地方移住による家賃節約効果は年間30〜60万円になることも。
                </p>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  このシミュレーターは、東京から2時間以内でアクセスできる26都市の実際の家賃相場・交通費・
                  移住補助金データをもとに計算しています。26都市を横断比較できるツールは国内でも珍しく、
                  自治体の補助金まで含めた実質コストを把握できます。
                </p>
              </div>
            </div>
          )}
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
