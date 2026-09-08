import { useRef, useState } from "react";
import { ClinicalFace } from "./components/ClinicalFace";
import { CLINIC_PRICE_URL, PATIENT_CONCERNS } from "./data/patientConsultation";
import type {
  ClinicalModelResult,
  ClinicalSettings,
  PatientConcern,
  PatientExample,
} from "./types/botox";
import "./styles/clinical.css";
import "./styles/patient.css";

const EXAMPLES: { id: PatientExample; label: string }[] = [
  { id: "expected", label: "期待できる変化" },
  { id: "limited", label: "変化が少ない例" },
  { id: "adverse", label: "副作用の例" },
];
const yen = (value: number) => value.toLocaleString("ja-JP") + "円";

function ConcernIcon({ concern }: { concern: PatientConcern }) {
  return (
    <svg viewBox="120 72 160 282" aria-hidden="true" className="concern-icon">
      <path
        d="M150 110 Q200 64 250 110 Q270 161 247 227 Q231 267 200 279 Q169 267 153 227 Q130 161 150 110Z M179 268 L178 300 Q172 318 149 324 M221 268 L222 300 Q228 318 251 324"
        fill="#fff5ee"
        stroke="#a8827f"
        strokeWidth="5"
      />
      <path
        d="M154 160 Q168 153 181 160 M219 160 Q233 153 246 160 M194 178 L189 207 Q200 213 211 207 M183 237 Q200 245 217 237"
        fill="none"
        stroke="#b39993"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {concern.areas.map((p, i) => (
        <ellipse
          key={i}
          cx={p.x}
          cy={p.y}
          rx={p.rx}
          ry={p.ry}
          fill="#bd3a68"
          fillOpacity=".65"
        />
      ))}
    </svg>
  );
}

export default function PatientApp() {
  const [selected, setSelected] = useState(PATIENT_CONCERNS[0]);
  const [example, setExample] = useState<PatientExample>("expected");
  const [zoom, setZoom] = useState(false);
  const [variantId, setVariantId] = useState("");
  const resultRef = useRef<HTMLElement>(null);
  const variant =
    selected.variants?.find((item) => item.id === variantId) ??
    selected.variants?.[0];
  const price = variant?.price ?? selected.price;
  const treatmentAreas = variant?.areas ?? selected.areas;
  const micro = selected.id === "micro";
  // Fixed schematic drawing settings. The clinical dose/depth engine is not used.
  const settings: ClinicalSettings = {
    region: selected.id === "micro" ? "bunny" : selected.id,
    layer: "superficial",
    corrugatorPart: "medial",
    time: 14,
    expression: 85,
    exposure: true,
    amount: 0,
  };
  const model: ClinicalModelResult = {
    targetLayer: "superficial",
    layerMatch: true,
    message: "説明用のイラスト",
    visualRelaxation: example === "limited" ? 0.12 : 0.75,
    visualAdverse: example === "adverse" ? 1 : 0,
    adverse: example === "adverse" ? selected.adverse : "none",
    state: "relaxed",
    title: "説明用のイラスト",
    detail: "",
    observation: "",
  };
  const afterCaption =
    example === "adverse"
      ? selected.adverseCaption
      : example === "limited"
        ? micro
          ? "毛穴の目立ち・テカリが残る例"
          : "しわや筋肉の動きが残る例"
        : selected.afterCaption;
  function chooseConcern(concern: PatientConcern) {
    setSelected(concern);
    setExample("expected");
    setZoom(false);
    setVariantId("");
    if (window.innerWidth < 860)
      resultRef.current?.scrollIntoView?.({
        behavior: "instant",
        block: "start",
      });
  }
  const faceProps = {
    settings,
    model,
    skin: 100,
    muscles: false,
    landmarks: false,
    zoom,
    onSelect: () => undefined,
    skinAreas: micro ? treatmentAreas : undefined,
  };

  return (
    <div className="clinical-app patient-app">
      <header className="patient-header">
        <a href="https://ueno-iin-biyou-miwa.com/" className="patient-clinic">
          長野市三輪 <strong>上野医院</strong>
          <span>美容皮膚科</span>
        </a>
        <span className="patient-header-tag">診察前のご相談ガイド</span>
      </header>
      <main className="patient-main">
        <div className="patient-intro">
          <p className="patient-kicker">ぽちっとしわとり</p>
          <h1>
            気になるところから、
            <br className="patient-mobile-break" />
            変化を見てみましょう。
          </h1>
          <p>お悩みを選ぶと、打つ場所・料金・変化・副作用がわかります。</p>
          <p className="patient-disclaimer">
            診察前の説明用です。図は仕上がりの予測ではありません。治療が合うかどうかは医師が診察で判断します。
          </p>
        </div>

        <div className="patient-layout">
          <section
            id="patient-concerns"
            className="patient-choices"
            aria-labelledby="concern-heading"
          >
            <div className="patient-step-heading">
              <span>01</span>
              <h2 id="concern-heading">気になるお悩みを選ぶ</h2>
            </div>
            <p className="patient-helper">ひとつずつ、押してみてください。</p>
            <div className="concern-grid">
              {PATIENT_CONCERNS.map((concern) => (
                <button
                  type="button"
                  key={concern.id}
                  className="concern-button"
                  aria-pressed={concern.id === selected.id}
                  aria-controls="patient-result"
                  onClick={() => chooseConcern(concern)}
                >
                  <ConcernIcon concern={concern} />
                  <span>{concern.label}</span>
                  <span className="concern-check" aria-hidden="true">
                    {concern.id === selected.id ? "✓" : "+"}
                  </span>
                </button>
              ))}
            </div>
            <div className="patient-choice-note">
              しわ・輪郭の原因によって、合う治療は異なります。気になる症状を、診察でもお伝えください。
            </div>
          </section>

          <section
            className="patient-result"
            id="patient-result"
            ref={resultRef}
            aria-labelledby="result-heading"
          >
            <div className="patient-result-top">
              <div>
                <p className="patient-kicker">選んだお悩み</p>
                <h2 id="result-heading">{selected.label}</h2>
                <p>{selected.treatment}</p>
              </div>
              <span className="patient-selection-status" role="status">
                {selected.shortName}を表示中
              </span>
            </div>
            <div className="patient-location">
              <span className="patient-map-dot" aria-hidden="true" />
              <div>
                <h3>このあたりに注射を検討します</h3>
                <p>{selected.location}</p>
              </div>
            </div>

            {selected.variants && (
              <fieldset className="patient-variants">
                <legend>
                  施術範囲を選ぶ <span>料金は税込</span>
                </legend>
                <div>
                  {selected.variants.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={variant?.id === item.id}
                      onClick={() => {
                        setVariantId(item.id);
                        setExample("expected");
                      }}
                    >
                      <span>{item.label}</span>
                      <strong>{yen(item.price.yen)}</strong>
                    </button>
                  ))}
                </div>
                <p>{selected.availability}</p>
              </fieldset>
            )}

            <section
              className={
                "patient-comparison " +
                (example === "adverse" ? "showing-adverse" : "")
              }
              aria-label="施術前と変化の比較"
            >
              <div className="patient-comparison-tools">
                <h3>顔の変化を見てみる</h3>
                <button
                  type="button"
                  aria-pressed={zoom}
                  onClick={() => setZoom((value) => !value)}
                >
                  {zoom ? "顔全体に戻す" : "部位を拡大"}
                  <span aria-hidden="true"> ↗</span>
                </button>
              </div>
              <div
                className="patient-example-switch"
                role="group"
                aria-label="変化の例を切り替える"
              >
                {EXAMPLES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={example === item.id}
                    onClick={() => setExample(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="patient-face-pair">
                <figure>
                  <div className="patient-face-label">施術前・打つ範囲</div>
                  <ClinicalFace
                    {...faceProps}
                    before
                    treatmentAreas={treatmentAreas}
                    accessibleLabel={
                      (variant?.label ?? selected.shortName) +
                      "の施術前。ピンクは施術を検討するおおよその範囲"
                    }
                  />
                  <figcaption>{selected.beforeCaption}</figcaption>
                </figure>
                <figure>
                  <div className="patient-face-label">
                    {EXAMPLES.find((item) => item.id === example)?.label}
                  </div>
                  {selected.id === "neck" && example === "adverse" ? (
                    <div className="patient-unseen-risk">
                      <span aria-hidden="true">!</span>
                      <strong>
                        飲み込みにくい
                        <br />
                        首に力が入らない
                      </strong>
                      <p>
                        顔の見た目だけでは
                        <br />
                        わかりません。
                      </p>
                    </div>
                  ) : (
                    <ClinicalFace
                      {...faceProps}
                      before={false}
                      accessibleLabel={
                        selected.shortName +
                        "の" +
                        afterCaption +
                        "。結果を予測する図ではありません"
                      }
                    />
                  )}
                  <figcaption>{afterCaption}</figcaption>
                </figure>
              </div>
              <p className="patient-figure-note">
                <span className="patient-map-dot" aria-hidden="true" />
                ピンクはおおよその施術範囲。正確な位置は診察で決めます。
              </p>
              <p className="patient-illustration-note">
                変化を強調した説明図です。実際の変化の程度や、副作用の発生を予測するものではありません。
              </p>
              {example === "limited" && (
                <p className="patient-example-message" role="status">
                  {micro
                    ? "毛穴の目立ちやテカリが、期待したほど変わらない場合もあります。肌の状態や原因によって、変化の感じ方は異なります。"
                    : "期待した変化が得られないこともあります。原因や筋肉の動きなどにより、しわや症状が残る場合があります。"}
                </p>
              )}
              {example === "adverse" && (
                <p className="patient-example-message risk" role="status">
                  {selected.adverseCaption}
                  。副作用の一例で、必ず起こるわけではありません。ほかの症状も下でご確認ください。
                </p>
              )}
            </section>

            <div id="patient-fees" className="patient-facts">
              <section
                className="patient-price-card"
                aria-labelledby="price-heading"
              >
                <p className="patient-card-number">02 / 料金</p>
                <h3 id="price-heading">費用の目安</h3>
                {price ? (
                  <>
                    <p className="patient-price" data-testid="treatment-price">
                      {yen(price.yen)}
                      <span>税込</span>
                    </p>
                    <p className="patient-price-scope">
                      {price.scope}の施術料金
                    </p>
                    {price.discount && (
                      <div className="patient-discount">
                        <span>金・土の対象日</span>
                        <strong>
                          {yen(price.discount)}
                          <small>税込</small>
                        </strong>
                        <p>2026年10月から月曜も対象</p>
                      </div>
                    )}
                    {selected.availability && (
                      <p className="patient-availability">
                        {selected.availability}
                      </p>
                    )}
                    {price.source && (
                      <a href={price.source} target="_blank" rel="noreferrer">
                        医院の料金案内を確認 ↗
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p
                      className="patient-price pending"
                      data-testid="treatment-price"
                    >
                      診察時にご案内
                    </p>
                    <p>施術範囲と対応可否を確認し、費用をご案内します。</p>
                  </>
                )}
                <p className="patient-price-note">
                  自由診療。ニューロノックス使用の参考料金です。診察料などを含む総額・適用条件は医院でご確認ください。
                </p>
              </section>
              <section
                className="patient-effect-card"
                aria-labelledby="effect-heading"
              >
                <p className="patient-card-number">03 / 変化</p>
                <h3 id="effect-heading">どんな変化を目指す？</h3>
                <p className="patient-main-copy">{selected.expected}</p>
                <div className="patient-timing">
                  <h4>いつごろ変わる？</h4>
                  <p>{selected.timing}</p>
                </div>
                <p className="patient-limit">{selected.limitation}</p>
              </section>
            </div>

            <section
              id="patient-risks"
              className="patient-risk-card"
              aria-labelledby="risk-heading"
            >
              <div className="patient-risk-top">
                <div>
                  <p className="patient-card-number">04 / 副作用</p>
                  <h3 id="risk-heading">起こる可能性があること</h3>
                </div>
                <button
                  type="button"
                  aria-pressed={example === "adverse"}
                  onClick={() => {
                    setExample(example === "adverse" ? "expected" : "adverse");
                    resultRef.current?.scrollIntoView?.({
                      behavior: "instant",
                      block: "start",
                    });
                  }}
                >
                  {example === "adverse"
                    ? "変化の図に戻す"
                    : "副作用の図を見る"}{" "}
                  ↑
                </button>
              </div>
              <ul className="patient-region-risks">
                {selected.risks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
              <p className="patient-common-risks">
                <strong>どの部位でも：</strong>
                痛み・腫れ・赤み・内出血、頭痛、表情の違和感、左右差、効果が十分に出ない可能性があります。
              </p>
              <p className="patient-urgent">
                施術後に息苦しさ、飲み込みにくさ、全身の力の入りにくさが出たときは、速やかに医療機関へ相談・受診してください。
              </p>
            </section>
          </section>
        </div>

        <section className="patient-about" aria-label="使用薬剤と情報の出典">
          <h2>診察で、ご自身に合う方法を相談しましょう。</h2>
          <p>
            図と費用は相談のための目安です。持病、服用中の薬、妊娠・授乳、これまでの施術歴なども医師にお伝えください。
          </p>
          <details>
            <summary>使用薬剤・料金の出典について</summary>
            <p>
              上野医院の公式案内と医院からの料金指定をもとに、2026年9月7日に確認した内容を掲載しています。使用薬剤はニューロノックスで、掲載額はボトックスビスタの料金ではありません。
            </p>
            <p>
              ニューロノックスは国内未承認の医薬品です。医院の案内では、国内代理店を経て医師が個人輸入しています。国内承認製剤にボトックスビスタ等があります。未承認薬は医薬品副作用被害救済制度の対象外です。
            </p>
            <div className="patient-source-links">
              <a href={CLINIC_PRICE_URL} target="_blank" rel="noreferrer">
                公式料金表
              </a>
              <a
                href="https://ueno-iin-biyou-miwa.com/siwa/"
                target="_blank"
                rel="noreferrer"
              >
                施術・効果の案内
              </a>
              <a
                href="https://ueno-iin-biyou-miwa.com/btx-difference/"
                target="_blank"
                rel="noreferrer"
              >
                薬剤の案内
              </a>
              <a
                href="https://ueno-iin-biyou-miwa.com/botox-failure-prevention/"
                target="_blank"
                rel="noreferrer"
              >
                副作用の案内
              </a>
            </div>
          </details>
        </section>
      </main>
      <nav className="patient-mobile-nav" aria-label="スマートフォンのメニュー">
        <a href="#patient-concerns">お悩みを選ぶ ↑</a>
        <a href="#patient-fees">料金・効果</a>
        <a href="#patient-risks">副作用</a>
      </nav>
      <footer className="patient-footer">
        ぽちっとしわとり · 患者さん向け相談版
        <span>医療行為や医師の診察を代替するものではありません。</span>
      </footer>
    </div>
  );
}
