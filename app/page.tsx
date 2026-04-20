import Link from "next/link";
import Image from "next/image";

const featuredContents = [
  {
    tag: "ツール",
    title: "移住コストシミュレーター",
    desc: "交通費・家賃・生活費を入力するだけ。二拠点生活の月額コストを即算出。",
    href: "/simulator",
    priority: true,
  },
  {
    tag: "移住先",
    title: "東京に通える移住先ランキング",
    desc: "新幹線・在来線別に「東京まで2時間圏内」の都市を徹底比較。家賃相場・自治体補助も掲載。",
    href: "/ranking",
    priority: false,
  },
  {
    tag: "グッズ",
    title: "移動を快適にするアイテム特集",
    desc: "週3往復の新幹線族が本当に使っているバッグ・ガジェット・サービスを厳選紹介。",
    href: "/items",
    priority: false,
  },
  {
    tag: "宿泊",
    title: "東京での宿泊戦略ガイド",
    desc: "賃貸 vs ホテル vs サブスク。週末利用パターン別にコストと利便性を比較検討。",
    href: "/stay",
    priority: false,
  },
  {
    tag: "サービス",
    title: "多拠点サブスクまとめ",
    desc: "ADDress、HafH、hotelif…月額制の拠点サービスを料金・エリア・使い勝手で比較。",
    href: "/subscriptions",
    priority: false,
  },
];

const phases = [
  {
    step: "01",
    title: "地方に拠点をつくる",
    desc: "東京から2時間圏内の都市に家を借りる。家賃は都内の半分以下が相場。",
  },
  {
    step: "02",
    title: "週末だけ東京へ",
    desc: "金曜夜か土曜朝に移動。新幹線や高速バスで、東京の仕事・人脈・文化を維持。",
  },
  {
    step: "03",
    title: "２拠点の生活を最適化",
    desc: "交通費・荷物・宿泊…慣れれば「都内一人暮らし」より安くなるケースも多い。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-sm border-b border-[#E5E2DC]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            週末東京族
          </Link>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-[#6B7280]">
            <Link href="/simulator" className="hover:text-[#1A1A1A] transition-colors">
              コストシミュレーター
            </Link>
            <Link href="/ranking" className="hover:text-[#1A1A1A] transition-colors">
              移住先ランキング
            </Link>
            <Link href="/items" className="hover:text-[#1A1A1A] transition-colors">
              移動グッズ
            </Link>
            <Link href="/stay" className="hover:text-[#1A1A1A] transition-colors">
              宿泊戦略
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* ロゴヘッダー */}
          <div className="flex flex-col items-center gap-6 mb-14 md:flex-row md:items-center md:gap-8">
            <Image
              src="/tokyozoku-logo.jpg"
              alt="週末東京族ロゴ"
              width={160}
              height={160}
              className="w-[120px] h-[120px] md:w-[160px] md:h-[160px]"
              priority
            />
            <div
              className="hidden md:block self-stretch w-px"
              style={{ backgroundColor: "#E5E2DC" }}
            />
            <div className="flex flex-col gap-2 items-center text-center md:items-start md:text-left">
              <h1
                style={{
                  color: "#1B3A6B",
                  fontWeight: 900,
                  fontSize: "36px",
                  lineHeight: 1.1,
                }}
              >
                週末東京族
              </h1>
              <p style={{ color: "#8B7535", fontSize: "16px" }}>
                地方に住む。東京を使う。
              </p>
              <hr style={{ borderColor: "#E5E2DC", margin: "4px 0" }} />
              <p style={{ color: "#6B7280", fontSize: "13px" }}>
                東京から2時間圏内の移住先を、コストで比較するメディア。
              </p>
              <p style={{ color: "#6B7280", fontSize: "13px" }}>
                46都市のデータをもとに、あなたの2拠点生活をシミュレーション。
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/simulator"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#1A1A1A] text-white text-sm font-medium rounded-full hover:bg-[#333] transition-colors"
            >
              コストを計算してみる
            </Link>
            <Link
              href="/ranking"
              className="inline-flex items-center justify-center h-12 px-8 border border-[#E5E2DC] text-sm font-medium rounded-full hover:bg-[#F0EDE8] transition-colors"
            >
              移住先を探す
            </Link>
          </div>
        </section>

        <div className="border-t border-[#E5E2DC]" />

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-xs font-medium tracking-[0.2em] text-[#8C6D46] uppercase mb-10">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            {phases.map((phase) => (
              <div key={phase.step}>
                <p className="text-4xl font-light text-[#E5E2DC] mb-4 leading-none">
                  {phase.step}
                </p>
                <h3 className="text-base font-semibold mb-2">{phase.title}</h3>
                <p className="text-sm text-[#6B7280]">{phase.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-[#E5E2DC]" />

        {/* Featured Contents */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-xs font-medium tracking-[0.2em] text-[#8C6D46] uppercase mb-10">
            Contents
          </h2>

          {/* Priority card */}
          <Link
            href={featuredContents[0].href}
            className="group block mb-6 p-8 bg-[#1A1A1A] text-white rounded-2xl hover:bg-[#2A2A2A] transition-colors"
          >
            <span className="text-xs font-medium tracking-widest text-[#C8A96E] uppercase">
              {featuredContents[0].tag}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold mt-3 mb-3 group-hover:opacity-80 transition-opacity">
              {featuredContents[0].title}
            </h3>
            <p className="text-sm text-[#A0A0A0] leading-relaxed max-w-lg">
              {featuredContents[0].desc}
            </p>
            <span className="inline-block mt-5 text-xs text-[#C8A96E] font-medium">
              試してみる →
            </span>
          </Link>

          {/* Grid cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {featuredContents.slice(1).map((content) => (
              <Link
                key={content.href}
                href={content.href}
                className="group block p-6 bg-white border border-[#E5E2DC] rounded-2xl hover:border-[#C8A96E] transition-colors"
              >
                <span className="text-xs font-medium tracking-widest text-[#8C6D46] uppercase">
                  {content.tag}
                </span>
                <h3 className="text-base font-semibold mt-2 mb-2 group-hover:text-[#8C6D46] transition-colors">
                  {content.title}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  {content.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="border-t border-[#E5E2DC]" />

        {/* Concept CTA */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-xs font-medium tracking-[0.2em] text-[#8C6D46] uppercase mb-6">
            About
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 leading-tight">
            移住したいけど、
            <br />
            東京は手放したくない。
          </h2>
          <p className="text-[#6B7280] max-w-lg mx-auto mb-8 text-sm leading-relaxed">
            週末東京族は、そんな「どちらかを選ばなきゃいけない」という思い込みを壊すメディアです。
            地方の豊かな環境と、東京のキャリア・人脈・カルチャー。
            両方を手に入れる生き方を、具体的なデータと体験で提案します。
          </p>
          <Link
            href="/about"
            className="inline-flex items-center justify-center h-11 px-7 border border-[#1A1A1A] text-sm font-medium rounded-full hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            コンセプトを読む
          </Link>
        </section>
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
