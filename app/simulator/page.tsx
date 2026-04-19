import type { Metadata } from "next";
import SimulatorClient from "./SimulatorClient";

export const metadata: Metadata = {
  title: "【無料】二拠点生活 費用シミュレーション｜週末東京族",
  description:
    "東京の高家賃を払い続けますか？地方移住 × 週末東京の2拠点生活で、年間いくら浮くかを無料シミュレーション。26都市の家賃・交通費・補助金データをもとに計算します。",
  openGraph: {
    title: "二拠点生活シミュレーター｜週末東京族",
    description: "移住で生まれる東京のお小遣いを計算。",
    url: "https://tokyozoku.com/simulator",
    type: "website",
  },
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
