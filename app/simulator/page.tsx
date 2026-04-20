import type { Metadata } from "next";
import SimulatorClient from "./SimulatorClient";

export const metadata: Metadata = {
  title: "【無料】二拠点生活 コストシミュレーション｜週末東京族",
  description:
    "東京の家賃と移住先の家賃・交通費・補助金を比較して、二拠点生活でいくら節約できるかを無料でシミュレーション。26都市を横断比較できます。",
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
