import { useId, useState } from "react";
import { CLINICAL_REGIONS, CLINICAL_SOURCES } from "../data/clinical";
import { getVistaReference, initialVistaDose, VISTA_DILUTIONS, VISTA_REFERENCES } from "../data/vista";
import { calculateVistaDose, formatVistaNumber, vistaConcentration } from "../engine/vista";
import type { ClinicalRegionId, VistaDoseInput } from "../types/botox";

const readNumber = (value: string): number | null => value.trim() === "" ? null : Number(value);
export function VistaDosePanel({ regionId }: { regionId: ClinicalRegionId }) {
  const [input, setInput] = useState<VistaDoseInput>(() => initialVistaDose(regionId));
  const prefix = useId();
  const reference = getVistaReference(regionId);
  const regionName = CLINICAL_REGIONS.find(r => r.id === regionId)!.name;
  const result = calculateVistaDose(input, regionId);
  const concentration = vistaConcentration(input.vialUnits, input.diluentMl);
  const change = (values: Partial<VistaDoseInput>) => setInput(current => ({ ...current, ...values }));
  const value = (number: number | null) => number === null ? "—" : formatVistaNumber(number);
  const pointUnits = input.totalUnits !== null && Number.isFinite(input.totalUnits) && input.points !== null && Number.isInteger(input.points) && input.points > 0 ? input.totalUnits / input.points : null;
  const hasWarnings = result.calculable && result.issues.some(i => i.level === "warning");
  return <section className="vista-panel" aria-labelledby={prefix + "-heading"}>
    <div className="vista-heading"><span className="eyebrow-label">ALLERGAN AESTHETICS · アッヴィ</span><h2 id={prefix + "-heading"}>ボトックスビスタ <span>U・mL計算</span></h2></div>
    <p className="vista-scope">{regionName} <span>{reference?.scope ?? "国内適応外・手入力の換算"} ／ この部位のみの計算</span></p>
    {reference ? <div className="vista-reference">
      <div><span>国内添付文書の通常用量</span><strong>{reference.minUnits}–{reference.maxUnits}<small> U</small></strong></div>
      <p>{reference.distribution}に均等分割。1点 {reference.minUnits / reference.points}–{reference.maxUnits / reference.points} U。</p>
      <div className="vista-dose-presets">
        {[reference.minUnits, reference.maxUnits].map(units => <button type="button" key={units} onClick={() => change({ totalUnits: units, points: reference.points })}>{units} Uの入力例</button>)}
      </div>
    </div> : <p className="vista-off-label">この部位の用量は国内添付文書にありません。投与量の初期値は入れず、指定されたUからmLへの換算を行います。</p>}

    <div className="vista-form-row">
      <label htmlFor={prefix + "-vial"}>バイアル規格<select id={prefix + "-vial"} aria-label="ボトックスビスタの規格" value={input.vialUnits} onChange={e => change({ vialUnits: Number(e.target.value) as 50 | 100 })}><option value="50">50 U</option><option value="100">100 U</option></select></label>
      <label htmlFor={prefix + "-saline"}>溶解する生理食塩液<div className="vista-input-unit"><input id={prefix + "-saline"} aria-label="生理食塩液の量 mL" type="number" min="0.001" step="0.01" inputMode="decimal" value={input.diluentMl ?? ""} onChange={e => change({ diluentMl: readNumber(e.target.value) })} /><span>mL</span></div></label>
    </div>
    <div className="vista-dilution-presets"><span>添文の溶解表</span>{VISTA_DILUTIONS.map(ml => <button type="button" key={ml} aria-pressed={input.diluentMl === ml} onClick={() => change({ diluentMl: ml })}>{ml} mL</button>)}</div>
    <div className="vista-concentration" aria-live="polite">
      <span>投与濃度</span><strong data-testid="vista-concentration">{value(concentration === null ? null : concentration / 10)}<small> U / 0.1 mL</small></strong><span>{value(concentration)} U/mL</span>
    </div>
    <div className="vista-form-row">
      <label htmlFor={prefix + "-total"}>この部位の総量<div className="vista-input-unit"><input id={prefix + "-total"} aria-label="この部位の総量 U" type="number" min="0" step="0.5" inputMode="decimal" value={input.totalUnits ?? ""} onChange={e => change({ totalUnits: readNumber(e.target.value) })} /><span>U</span></div></label>
      <label htmlFor={prefix + "-points"}>均等に分割する点数<div className="vista-input-unit"><input id={prefix + "-points"} aria-label="分割する点数" type="number" min="1" step="1" inputMode="numeric" value={input.points ?? ""} onChange={e => change({ points: readNumber(e.target.value) })} /><span>点</span></div></label>
    </div>
    <label className="vista-point-input" htmlFor={prefix + "-point-units"}>1点あたりの投与量<div className="vista-input-unit"><input id={prefix + "-point-units"} aria-label="1点あたりの投与量 U" type="number" min="0" step="0.1" inputMode="decimal" disabled={input.points === null || !Number.isInteger(input.points) || input.points <= 0} value={pointUnits ?? ""} onChange={e => { const units = readNumber(e.target.value); change({ totalUnits: units === null || input.points === null ? null : units * input.points }); }} /><span>U/点</span></div></label>
    <div className="vista-results" aria-live="polite">
      <div><span>1点あたりの注入量</span><strong data-testid="vista-point-volume">{value(result.calculable ? result.mlPerPoint : null)}<small> mL</small></strong></div>
      <div><span>この部位の合計液量</span><strong data-testid="vista-total-volume">{value(result.calculable ? result.totalMl : null)}<small> mL</small></strong></div>
    </div>
    <div className={"vista-checks " + (hasWarnings ? "has-warning" : "")} aria-live="polite">
      {!result.calculable ? <ul>{result.errors.map(error => <li key={error}>{error}</li>)}</ul> : <>
        {result.issues.length > 0 && <ul>{result.issues.map(issue => <li key={issue.id} data-issue={issue.id} className={issue.level}>{issue.level === "warning" && <b>要確認 · </b>}{issue.message}</li>)}</ul>}
        {input.totalUnits === 0 ? <p>未投与（0 U）の計算です。</p> : !hasWarnings && reference ? <p>添文との用量・液量の照合です。個別の投与適否や安全性の判定ではありません。</p> : null}
        {reference && <p>1点の液量上限：{reference.maxMlPerPoint} mL ／ 1回の総量上限：{reference.maxUnits} U</p>}
      </>}
    </div>
    <details className="vista-formula"><summary>計算式・用量一覧</summary>
      <p>濃度 ＝ {input.vialUnits} U ÷ {value(input.diluentMl)} mL ＝ {value(concentration)} U/mL</p>
      {result.calculable && <><p>1点のU ＝ {value(input.totalUnits)} U ÷ {input.points}点 ＝ {value(result.unitsPerPoint)} U</p><p>1点のmL ＝ {value(result.unitsPerPoint)} U ÷ {value(concentration)} U/mL ＝ {value(result.mlPerPoint)} mL</p></>}
      <p>表示は最大小数4桁。上限との照合には丸め前の値を使います。</p>
      <div className="vista-table-scroll"><table><caption>65歳未満の成人・国内添付文書</caption><thead><tr><th>部位</th><th>総量</th><th>点数</th><th>液量上限/点</th></tr></thead><tbody>{Object.values(VISTA_REFERENCES).map(r => <tr key={r.id}><th>{r.name}</th><td>{r.minUnits}–{r.maxUnits} U</td><td>{r.points}</td><td>{r.maxMlPerPoint} mL</td></tr>)}</tbody></table></div>
      <p>目尻・エラの総量は左右合計。眉間＋目尻の同時投与上限は44 U。咬筋と眉間・目尻の同時投与は、添文記載の臨床試験経験がありません。3か月以内の再投与は避けます。</p>
      <p>100 U規格の国内適応は咬筋膨隆です。他製剤のUには換算できません。</p>
    </details>
    {reference && <details className="vista-trial"><summary>国内試験での効果 <span>{reference.trial.time}</span></summary>
      <p>{reference.trial.population}を対象とした国内第III相試験。</p>
      <p className="vista-endpoint">{reference.trial.endpoint}</p>
      <div className="vista-trial-arms">{reference.trial.arms.map(arm => <div key={arm.units} className={input.totalUnits === arm.units ? "is-selected" : ""}><span>{arm.units} U群</span><strong>{arm.rate}<small>%</small></strong><span>{arm.responders} / {arm.evaluated}例</span></div>)}</div>
      {input.totalUnits !== null && !reference.trial.arms.some(arm => arm.units === input.totalUnits) && <p>入力した{value(input.totalUnits)} Uの試験値は、この表にはありません。</p>}
      <p>試験集団で改善した人の割合です。しわの減少率や個人の成功確率ではなく、入力した濃度・深度・点数での予測値でもありません。量の間を補間しません。</p>
      <a href={CLINICAL_SOURCES.pmda.url} target="_blank" rel="noreferrer">電子添文 {reference.trial.section}・17.3節 ↗</a>
    </details>}
    <p className="vista-footnote">U・mLは計算値、顔の変化は独立した教材の例です。投与量から個人の効果・副作用を自動予測するものではありません。</p>
    <a className="vista-source" href={CLINICAL_SOURCES.pmda.url} target="_blank" rel="noreferrer">国内電子添文 · 2026年8月 第4版 ↗</a>
  </section>;
}
