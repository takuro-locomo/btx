import { useEffect, useId, useState } from "react";
import { ClinicalFace } from "./components/ClinicalFace";
import { ClinicalSection } from "./components/ClinicalSection";
import { CLINICAL_REGIONS, CLINICAL_SOURCES, LAYERS, TIMES } from "./data/clinical";
import { evaluateClinicalModel, getLayerMessage } from "./engine/clinical";
import type { ClinicalRegionId, ClinicalSettings, ClinicalView } from "./types/botox";
import "./styles/clinical.css";

const INITIAL: ClinicalSettings = {
  region: "glabella", layer: "deep", corrugatorPart: "medial",
  time: 14, expression: 85, exposure: true, amount: 100,
};
const VIEWS: { id: ClinicalView; name: string; icon: string }[] = [
  { id: "surface", name: "顔と変化", icon: "01" },
  { id: "anatomy", name: "筋肉と皮膚", icon: "02" },
  { id: "section", name: "層と深度", icon: "03" },
];

export default function ClinicalApp() {
  const [settings, setSettings] = useState<ClinicalSettings>(INITIAL);
  const [view, setView] = useState<ClinicalView>("surface");
  const [skin, setSkin] = useState(28);
  const [landmarks, setLandmarks] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [motion, setMotion] = useState(1);
  const [atlas, setAtlas] = useState<"anterior" | "lateral">("anterior");
  const [compare, setCompare] = useState(false);
  const [imageError, setImageError] = useState(false);
  const region = CLINICAL_REGIONS.find(r => r.id === settings.region)!;
  const model = evaluateClinicalModel(settings);
  const phase = TIMES.find(t => t.day === settings.time)!;
  const detailId = useId();
  const change = (values: Partial<ClinicalSettings>) => setSettings(s => ({ ...s, ...values }));
  const selectRegion = (id: ClinicalRegionId) => {
    const r = CLINICAL_REGIONS.find(item => item.id === id)!;
    setSettings(s => ({ ...s, region: id, layer: r.layer, corrugatorPart: "medial", exposure: false }));
    setZoom(false);
    setCompare(false);
  };
  const reset = () => {
    setSettings(INITIAL); setZoom(false); setCompare(false);
    setSkin(28); setLandmarks(false); setView("surface"); setPlaying(false); setMotion(1);
  };
  useEffect(() => {
    if (!playing) { setMotion(1); return; }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setPlaying(false); return; }
    const start = performance.now();
    const timer = window.setInterval(() => setMotion(.5 - .5 * Math.cos((performance.now() - start) / 600)), 40);
    return () => window.clearInterval(timer);
  }, [playing]);
  const scenario = (amount: number) => {
    change({ amount, layer: model.targetLayer, time: 14, exposure: true });
    setView("surface");
  };
  return (
    <div className="clinical-app">
      <header className="clinical-header">
        <div>
          <p className="clinic-name">長野市三輪 美容クリニック 上野医院</p>
          <h1>ぽちっとしわとり <span>Clinical Lab</span></h1>
          <p className="header-description">顔に触れて、筋肉・深度・作用のつながりを学ぶ。</p>
        </div>
        <a className="original-link" href="https://pochitto-shiwatori.vercel.app/" target="_blank" rel="noreferrer">元のアプリ ↗</a>
      </header>

      <nav className="clinical-view-nav" aria-label="モデルの表示">
        <div>{VIEWS.map(item => (
          <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => { setView(item.id); setZoom(false); }}>
            <span>{item.icon}</span>{item.name}
          </button>
        ))}</div>
      </nav>

      <main className="clinical-main">
        <div className="clinical-region-bar" aria-label="学習する部位">
          {CLINICAL_REGIONS.map((r, i) => (
            <button key={r.id} type="button" aria-pressed={r.id === region.id} onClick={() => selectRegion(r.id)}>
              <span className="region-number">{String(i + 1).padStart(2, "0")}</span>{r.name}
            </button>
          ))}
        </div>
        <div className="clinical-workspace">
          <section className="model-card" aria-label="顔面モデル">
            <div className="model-heading">
              <div><span className="eyebrow-label">{view === "section" ? "TISSUE PLANES" : "FACIAL ANATOMY"}</span><h2>{view === "section" ? "針先の層を確かめる" : view === "surface" ? "打つ前と後を、同じ表情で。" : "見えているしわ、その下には。"}</h2></div>
              <button className="quiet-button" type="button" onClick={reset}>リセット</button>
            </div>
            {view !== "section" ? (
              <>
                {view === "surface" ? <>
                  <div className="comparison-toolbar">
                    <span>同じ表情・同じ顔で比較</span>
                    <button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? "顔全体に戻す" : "部位を拡大"}</button>
                  </div>
                  <div className={"face-comparison " + (zoom ? "is-zoomed" : "")}>
                    <div className="comparison-face"><div className="comparison-label"><span>BEFORE</span><strong>打つ前</strong></div>
                      <ClinicalFace settings={settings} model={model} skin={100} muscles={false} landmarks={landmarks} before zoom={zoom} motion={motion} onSelect={selectRegion} />
                      <span className="face-bottom-label">本来の動き</span>
                    </div>
                    <div className={"comparison-face current state-" + model.state}><div className="comparison-label"><span>AFTER · {phase.label}</span><strong>現在の条件</strong></div>
                      <ClinicalFace settings={settings} model={model} skin={100} muscles={false} landmarks={landmarks} before={false} zoom={zoom} motion={motion} onSelect={selectRegion} />
                      <span className="face-bottom-label">{model.visualRelaxation < .35 ? "動きが残る" : model.visualRelaxation < .85 ? "動きが弱まる" : "動きがごく小さい"}</span>
                    </div>
                  </div>
                  <p className="figure-caption">変化を強調した模式表示。実際の仕上がりを予測するものではありません。</p>
                </> : <>
                  <div className="face-stage">
                    <div className="stage-tag">皮膚 ＋ 筋線維</div><span className="stage-orientation">前面投影</span>
                    <ClinicalFace settings={settings} model={model} skin={skin} muscles landmarks={landmarks} before={false} motion={motion} onSelect={selectRegion} />
                    <div className="selected-anatomy-label"><span className="tiny-line" /><strong>{region.muscles}</strong><span>{region.action}</span></div>
                  </div>
                  <p className="figure-caption">丸印は部位選択用。筋の青紫色は作用の模式表示です。</p>
                  <div className="skin-control">
                    <label htmlFor="skin-range">皮膚の重なり <span>{skin}%</span></label>
                    <input id="skin-range" type="range" min="0" max="100" step="1" value={skin} onChange={e => setSkin(Number(e.target.value))} />
                    <div className="range-ends"><span>筋肉を透かす</span><span>皮膚を残す</span></div>
                  </div>
                </>}
                <label className="check-row"><input type="checkbox" checked={landmarks} onChange={e => setLandmarks(e.target.checked)} />瞳孔線・眼窩上縁の位置関係を表示</label>
              </>
            ) : (
              <div className="large-section">
                <p className="section-context">{region.muscles} <span>模式断面・実寸ではありません</span></p>
                <ClinicalSection settings={settings} region={region} model={model} />
                <p className="diagram-callout">{model.message}</p>
                <button type="button" className="compare-toggle" aria-pressed={compare} onClick={() => setCompare(!compare)}>{compare ? "深度の比較を閉じる" : "浅い筋層と深い筋層を並べて比較"}</button>
                {compare && <div className="section-comparison">{(["superficial", "deep"] as const).map(layer => {
                  const comparison = { ...settings, layer };
                  const result = evaluateClinicalModel(comparison);
                  return <div key={layer}><h3>{layer === "superficial" ? "浅い筋層" : "深い筋層"}</h3><ClinicalSection settings={comparison} region={region} model={result} /><p>{getLayerMessage(comparison)}</p></div>;
                })}</div>}
                <div className="section-hint"><strong>深さの数字より、どの層にいるか。</strong><p>同じ刺入長でも、場所・皮下組織の厚さ・針の角度で針先の層は変わります。このモデルは共通のmm深度を定めません。</p></div>
              </div>
            )}
            <div className={"effect-readout state-" + model.state} aria-live="polite" role="status">
              <div className="effect-state-heading"><span className="effect-symbol">{model.state === "excess" || model.state === "spread" ? "!" : model.state === "relaxed" ? "↓" : "≈"}</span><strong>{model.title}</strong></div>
              <p>{model.detail}</p>
              <div className="movement-meter"><span>目的筋の動き</span><div className="movement-track" aria-hidden="true"><i style={{ width: (1 - model.visualRelaxation) * 100 + "%" }} /></div><b>{model.visualRelaxation < .35 ? "残る" : model.visualRelaxation < .85 ? "弱まる" : "ごく小さい"}</b></div>
              {model.visualAdverse > .15 && <p className="adverse-observation">{model.observation}</p>}
            </div>
            <div className="dose-controls">
              <h3 className="effect-choice-title">効き方を比べる</h3>
              <div className="scenario-buttons" aria-label="効き方の比較">
                <button type="button" onClick={() => scenario(25)}>効きにくい例</button>
                <button type="button" onClick={() => scenario(100)}>動きが弱まる例</button>
                <button type="button" onClick={() => scenario(190)}>効きすぎの例</button>
              </div>
              <p className="scenario-hint">例のボタンは目的筋の層・2週に切り替えます。</p>
              <label className="quick-depth">深度を比較<select aria-label="比較する針先の層" value={settings.layer} onChange={e => change({ layer: e.target.value as ClinicalSettings["layer"] })}>{LAYERS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select><button type="button" onClick={() => setView("section")}>断面を見る ↗</button></label>
              <button type="button" className={"exposure-button " + (settings.exposure ? "is-on" : "")} aria-pressed={settings.exposure} onClick={() => change({ exposure: !settings.exposure })}>
                <span className="switch-indicator" />{settings.exposure ? "注入後の変化を表示中" : "この条件で打った変化を見る"}
              </button>
            </div>
            <div className="expression-control">
              <button type="button" className="motion-button" aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? "Ⅱ 動きを止める" : "▷ 表情をくり返す"}</button>
              <label htmlFor="expression-range">表情を動かす <strong>{settings.expression === 0 ? "安静" : settings.expression < 50 ? "軽い動き" : "強い動き"}</strong></label>
              <input id="expression-range" type="range" min="0" max="100" value={settings.expression} onChange={e => { setPlaying(false); change({ expression: Number(e.target.value) }); }} />
              <div className="range-ends"><span>安静</span><span>{region.id === "masseter" ? "噛みしめる" : region.id === "glabella" ? "眉を寄せる" : "動かす"}</span></div>
            </div>
          </section>

          <section className="clinical-controls" aria-labelledby={detailId}>
            <div className="region-detail">
              <div className="detail-topline"><span className="eyebrow-label">{region.english}</span><span className={"indication " + (region.approved ? "approved" : "")}>{region.approved ? "国内適応あり＊" : "解剖学習"}</span></div>
              <h2 id={detailId}>{region.name}<span>{region.muscles}</span></h2>
              <p>{region.anatomy}</p>
              <div className="observation"><span>観察する動き</span><p>{region.observation}</p></div>
            </div>
            <div className="depth-controls">
              <div className="control-title"><span className="step-number">1</span><h3>針先の層を変える</h3><button type="button" className="text-button" onClick={() => setView("section")}>断面を大きく ↗</button></div>
              {region.id === "glabella" && <div className="corrugator-location" aria-label="皺眉筋の観察位置">
                <span>皺眉筋のどこ？</span>
                <button type="button" aria-pressed={settings.corrugatorPart === "medial"} onClick={() => change({ corrugatorPart: "medial" })}>内側</button>
                <button type="button" aria-pressed={settings.corrugatorPart === "lateral"} onClick={() => change({ corrugatorPart: "lateral" })}>外側</button>
              </div>}
              <div className="layer-buttons" aria-label="針先の層">
                {LAYERS.map(layer => <button key={layer.id} type="button" aria-pressed={settings.layer === layer.id} onClick={() => change({ layer: layer.id })}>{layer.name}<span>{layer.short}</span></button>)}
              </div>
              {view !== "section" && <ClinicalSection settings={settings} region={region} model={model} />}
              <p className="layer-explanation" aria-live="polite">{getLayerMessage(settings)}</p>
            </div>

            <div className="time-controls">
              <div className="control-title"><span className="step-number">2</span><h3>作用の経過を見る</h3></div>
              <div className="time-buttons" aria-label="投与後の経過シナリオ">{TIMES.map(t => <button key={t.day} type="button" aria-pressed={settings.time === t.day} onClick={() => change({ time: t.day })}>{t.label}</button>)}</div>
              <div className="phase-note" aria-live="polite"><strong>{phase.title}</strong><p>{phase.note}</p></div>
              <p className="model-state">深度・経過・効き方を比較する教材です。色・変形・棒の長さは臨床的な効力や発生確率ではありません。</p>
            </div>
          </section>
        </div>

        <section className="learning-row">
          <div className="mechanism-card">
            <span className="eyebrow-label">HOW IT WORKS · 筋内で作用する場合</span><h2>筋肉への指令が、届きにくくなる。</h2>
            <div className={"signal-diagram " + (model.visualRelaxation > .15 ? "signal-reduced" : "")} aria-label="神経終末でアセチルコリンの放出が抑えられ、筋活動が弱まる仕組み">
              <div className="signal-node"><span>運動神経終末</span><strong>SNAP-25</strong><small>{model.visualRelaxation > .15 ? "毒素が切断" : "小胞の放出に関与"}</small></div>
              <div className="signal-path"><span>アセチルコリン</span><i /><i /><i /><i /><i /><small>{model.visualRelaxation > .15 ? "放出が抑制される" : "放出 → 筋へ伝達"}</small></div>
              <div className="signal-node muscle-node"><span>筋線維</span><strong>{model.visualRelaxation > .15 ? "活動が弱まる" : "収縮する"}</strong><small>神経筋接合部</small></div>
            </div>
            <p>筋肉を埋めたり、しわを直接消したりする作用ではありません。神経筋伝達が弱まることで、表情の動きが変わります。安静時のしわは残ることがあります。</p>
            <a href={CLINICAL_SOURCES.mechanism.url} target="_blank" rel="noreferrer">作用機序の出典 ↗</a>
          </div>
          <div className="clinical-note-card">
            <span className="eyebrow-label">CLINICAL CONNECTION</span><h2>この部位で考えたいこと</h2>
            <p className="caution-text">{region.caution}</p>
            <div className="fact-pair"><span>深度だけでなく</span><p>位置・筋量・製剤・用量・液量・個体差が関係します。</p></div>
            <div className="fact-pair"><span>図の読み方</span><p>境界や分布の輪郭は簡略化しています。患者ごとの安全性や効果の予測には使えません。</p></div>
            <div className="source-links">{["atlas" as const, ...region.sources].map(id => <a key={id} href={CLINICAL_SOURCES[id].url} target="_blank" rel="noreferrer">{CLINICAL_SOURCES[id].title} ↗</a>)}</div>
          </div>
        </section>

        <details className="atlas-details">
          <summary><span><span className="eyebrow-label">ANATOMY ATLAS</span><strong>解剖図譜で、筋の重なりを確認する</strong></span><span className="expand-sign">＋</span></summary>
          <div className="atlas-content">
            <div className="atlas-buttons"><button type="button" aria-pressed={atlas === "anterior"} onClick={() => { setAtlas("anterior"); setImageError(false); }}>前面・表層</button><button type="button" aria-pressed={atlas === "lateral"} onClick={() => { setAtlas("lateral"); setImageError(false); }}>側面・剖出</button></div>
            <p>{atlas === "anterior" ? "前頭筋、眼輪筋、口輪筋と隣接筋の前面像。皺眉筋は、この表層図では単独に露出していません。" : "皺眉筋と咬筋が露出した側面の解剖図です。一部の筋は切離されており、通常の表層像とは異なります。"}</p>
            {imageError ? <p role="alert">図を表示できませんでした。下の出典リンクから原図をご覧ください。</p> : <img loading="lazy" src={atlas === "anterior" ? "/anatomy/openstax-face-anterior.jpg" : "/anatomy/sobotta-262.jpg"} alt={atlas === "anterior" ? "OpenStaxの顔面表情筋・前面解剖図" : "Sobotta 1909 顔面の側面剖出図"} onError={() => setImageError(true)} />}
            <p className="atlas-credit">{atlas === "anterior" ? <>OpenStax / CNX Anatomy 2013 · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> · <a href="https://commons.wikimedia.org/wiki/File:1106_Front_Views_of_the_Muscles_of_Facial_Expressions.jpg" target="_blank" rel="noreferrer">原図</a></> : <>Johannes Sobotta, 1909 · Public domain · <a href="https://commons.wikimedia.org/wiki/File:Sobo_1909_262.png" target="_blank" rel="noreferrer">原図</a></>}</p>
          </div>
        </details>
        <details className="evidence-details">
          <summary>出典とモデルの範囲 <span>確認日 2026.09.07</span></summary>
          <div>
            <p>＊国内適応の表示はボトックスビスタの電子添文に基づき、65歳未満の成人における対象適応を指します。その他の部位は解剖学習として表示しています。製剤間で単位を換算しません。</p>
            <p>顔は既存のイラストを用いた前面投影、深度は相対層の模式断面です。患者のCT・MRI・超音波に基づく3Dモデルではありません。しわ・筋線維の変化は説明用で、臨床データに適合した効果曲線や副作用確率ではありません。</p>
            <p>顔の変化は、選んだ効き方・深度・経過を説明する教材の例です。個人の効果や安全性を予測するものではありません。</p>
            <ul>{Object.values(CLINICAL_SOURCES).map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><span>{s.detail}</span></li>)}</ul>
          </div>
        </details>
      </main>
      <footer className="clinical-footer"><strong>Clinical Lab · 教育用モデル</strong><p>医療行為・個別の治療判断を代替しません。実際の投与は診察と医師の判断に基づきます。</p></footer>
    </div>
  );
}
