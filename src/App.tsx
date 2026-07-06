/**
 * App.tsx — 患者向けボトックス体感ツール
 *
 * 仕様: デフォルトで全部位に悩み（シワ・たるみ等）が出ている状態。
 *       気になる部位をタップすると、その悩みが消え（＝治療）、
 *       タップした部位の合計料金と説明が表示される。
 *       段1＝表情ジワ＋たるみ（写真）／段2＝エラ・毛穴・ガミー（専用図）。
 *
 * ※ 料金は上野医院の掲載価格に準拠した目安。最終判断は必ず医師の診察による。
 */

import { useMemo, useState } from "react";
import { PatientFaceView } from "./components/PatientFaceView";
import { JawView, PoreView, SmileView } from "./components/TreatmentTiles";
import {
  PATIENT_AREAS,
  POPULAR_MENUS,
  REASSURE_POINTS,
  type PatientArea,
  type WrinkleKey,
} from "./data/patientAreas";

const FACE1_AREAS = PATIENT_AREAS.filter((a) => a.section === "face1");
const FACE2_AREAS = PATIENT_AREAS.filter((a) => a.section === "face2");
const FACE1_KEYS = FACE1_AREAS.flatMap((a) => a.wrinkleKeys);

// 段2タイルの短いラベル
const TILE_LABEL: Record<string, string> = {
  masseter: "エラ（小顔）",
  pores: "毛穴・テカリ",
  gummy: "ガミースマイル",
};

const yen = (n: number) => "¥" + n.toLocaleString("ja-JP");

function priceOf(areas: PatientArea[]) {
  let weekday = 0;
  let weekend = 0;
  for (const a of areas) {
    if (a.priceValue == null) continue;
    weekday += a.priceValue;
    weekend += a.weekendValue ?? a.priceValue;
  }
  return { weekday, weekend };
}

export default function App() {
  // タップ済み（＝治療する）部位のID
  const [treated, setTreated] = useState<string[]>([]);

  const treatedAreas: PatientArea[] = useMemo(
    () => PATIENT_AREAS.filter((a) => treated.includes(a.id)),
    [treated],
  );
  const treatedKeys: WrinkleKey[] = useMemo(
    () => treatedAreas.flatMap((a) => a.wrinkleKeys),
    [treatedAreas],
  );
  const grand = useMemo(() => priceOf(treatedAreas), [treatedAreas]);

  const face2Treated = FACE2_AREAS.filter((a) => treated.includes(a.id));

  const toggle = (id: string) =>
    setTreated((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50 text-slate-800">
      {/* ヘッダー */}
      <header className="px-5 pt-8 pb-3 text-center">
        <p className="text-rose-500 text-xs font-bold tracking-widest">MEDICAL BEAUTY</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-800 leading-snug">
          気になるトコ、<span className="text-rose-500">タップ</span>で
          <br className="sm:hidden" />
          消してみて
        </h1>
        <p className="mt-2 text-sm text-slate-500">悩みをタップすると消えて、料金がわかります</p>
      </header>

      <main className="max-w-md mx-auto px-4 pb-28">
        {/* ===== 段1：表情ジワ＋フェイスライン（写真） ===== */}
        <section>
          <div className="text-center text-xs font-bold text-rose-400 mb-2">シワ・たるみ</div>
          <div className="rounded-3xl bg-white shadow-xl shadow-rose-100/70 border border-rose-100 overflow-hidden">
            <PatientFaceView
              renderKeys={FACE1_KEYS}
              treatedKeys={treatedKeys}
              hitAreas={FACE1_AREAS.map((a) => ({ id: a.id, keys: a.wrinkleKeys }))}
              treatedIds={treated}
              onToggleArea={toggle}
            />
          </div>
          <p className="mt-1 text-center text-[11px] text-slate-400">
            気になる部分（<span className="text-rose-400 font-bold">●</span>）を直接タップしてもOK
          </p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {FACE1_AREAS.map((a) => (
              <Pill key={a.id} area={a} on={treated.includes(a.id)} onClick={() => toggle(a.id)} />
            ))}
          </div>
          <SubtotalBar title="シワ・たるみ" areas={FACE1_AREAS.filter((a) => treated.includes(a.id))} />
        </section>

        {/* ===== 段2：エラ・毛穴・ガミースマイル（専用ビフォーアフター図） ===== */}
        <section className="mt-8">
          <div className="text-center text-xs font-bold text-rose-400 mb-2">小顔・毛穴・口もと</div>
          <div className="grid grid-cols-3 gap-2">
            {FACE2_AREAS.map((a) => {
              const on = treated.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`rounded-2xl border p-2 flex flex-col items-center transition-all ${
                    on ? "bg-rose-50 border-rose-300 shadow-md shadow-rose-100" : "bg-white border-rose-100"
                  }`}
                >
                  <div className="relative w-full aspect-square flex items-center justify-center">
                    <span
                      className={`absolute top-0.5 left-0.5 z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        on ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {on ? "施術後" : "施術前"}
                    </span>
                    {a.tileView === "jaw" && <JawView treated={on} />}
                    {a.tileView === "pore" && <PoreView treated={on} />}
                    {a.tileView === "smile" && <SmileView treated={on} />}
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-slate-700 text-center leading-tight">
                    {TILE_LABEL[a.id] ?? a.label}
                  </div>
                </button>
              );
            })}
          </div>
          <SubtotalBar title="小顔・毛穴・口もと" areas={face2Treated} />
        </section>

        {/* ===== 全体の合計＋説明 ===== */}
        {treatedAreas.length > 0 ? (
          <section className="mt-6 space-y-3">
            <div className="rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-200 p-4">
              <div className="text-xs font-bold text-rose-100">
                全体の合計（{treatedAreas.length}部位・税込）
              </div>
              <div className="mt-1 flex items-end gap-2 flex-wrap">
                <span className="text-3xl font-extrabold">{yen(grand.weekday)}</span>
                <span className="text-sm font-bold text-rose-100 mb-1">
                  金土なら {yen(grand.weekend)}
                </span>
              </div>
              <div className="mt-1.5 text-[11px] text-rose-100 leading-relaxed">
                ニューロノックス使用・自由診療。金土は表情ジワが割引（1部位 ¥11,000）。
              </div>
            </div>

            {treatedAreas.map((a) => (
              <div key={a.id} className="rounded-2xl bg-white border border-rose-100 shadow-sm p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{a.icon}</span>
                  <h3 className="font-extrabold text-slate-800">{a.label}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{a.afterMessage}</p>
                <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-400 font-bold shrink-0">料金</span>
                  <span className="text-sm font-extrabold text-rose-600 text-right">{a.priceLabel}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400 text-right">効果 {a.duration}持続</div>
              </div>
            ))}
          </section>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-400">
            👆 気になるところをタップすると、消えて料金が出ます
          </p>
        )}

        {/* 安心ポイント */}
        <section className="mt-8">
          <h2 className="text-center text-sm font-bold text-slate-500 mb-3">はじめての方も安心の理由</h2>
          <div className="grid grid-cols-2 gap-3">
            {REASSURE_POINTS.map((r) => (
              <div key={r.title} className="rounded-2xl bg-white/80 border border-rose-100 p-3.5">
                <div className="text-xl">{r.icon}</div>
                <div className="mt-1 font-bold text-sm text-slate-800">{r.title}</div>
                <div className="mt-0.5 text-xs text-slate-500 leading-relaxed">{r.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 人気メニュー */}
        <section className="mt-8">
          <h2 className="text-center text-sm font-bold text-slate-500 mb-3">そのほかの人気メニュー</h2>
          <div className="space-y-2">
            {POPULAR_MENUS.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-xl bg-white border border-rose-100 px-4 py-3">
                <span className="text-lg shrink-0">{m.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-800">{m.label}</div>
                  <div className="text-xs text-slate-500">{m.benefit}</div>
                </div>
                <div className="text-xs font-extrabold text-rose-500 text-right shrink-0">{m.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 免責 */}
        <p className="mt-8 text-[11px] leading-relaxed text-slate-400 text-center">
          ※ 表示している変化はイメージであり、効果には個人差があります。
          料金はすべて税込の目安です。使用する『ニューロノックス』は国内未承認の
          ボツリヌストキシン製剤で、医師の判断により個人輸入したものです（重篤な副作用の
          際も医薬品副作用被害救済制度の対象外）。同成分の国内承認品にアラガン社
          ボトックスビスタがあります。実際の施術内容・費用・リスク・副作用は、必ず医師の
          診察・カウンセリングにてご説明します。自由診療（保険適用外）です。
        </p>
      </main>

      {/* 固定CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-rose-100 px-4 py-3">
        <div className="max-w-md mx-auto flex gap-2">
          <a
            href="#reserve"
            className="flex-1 text-center py-3.5 rounded-2xl bg-rose-500 text-white font-extrabold shadow-lg shadow-rose-200 active:scale-95 transition-transform"
          >
            無料カウンセリングを予約
          </a>
          <a
            href="#line"
            className="px-5 py-3.5 rounded-2xl bg-[#06C755] text-white font-bold active:scale-95 transition-transform"
          >
            LINE相談
          </a>
        </div>
      </div>
    </div>
  );
}

function Pill({ area, on, onClick }: { area: PatientArea; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-bold border transition-all ${
        on
          ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200"
          : "bg-white border-rose-200 text-rose-500"
      }`}
    >
      <span className="mr-1">{on ? "✓" : area.icon}</span>
      {area.label}
    </button>
  );
}

function SubtotalBar({ title, areas }: { title: string; areas: PatientArea[] }) {
  if (areas.length === 0) return null;
  const { weekday, weekend } = priceOf(areas);
  return (
    <div className="mt-3 rounded-2xl bg-rose-500 text-white px-4 py-2.5 flex items-center justify-between gap-2 shadow-md shadow-rose-200">
      <span className="text-xs font-bold text-rose-100 shrink-0">
        {title}の合計（{areas.length}部位）
      </span>
      <span className="text-right leading-tight">
        <span className="text-lg font-extrabold">{yen(weekday)}</span>
        <span className="text-[11px] text-rose-100 ml-1">金土 {yen(weekend)}</span>
      </span>
    </div>
  );
}
