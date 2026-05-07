# ボトックス（A型ボツリヌス毒素）エビデンスベース・ナレッジ集

> シミュレーションアプリのデータ基盤。すべての投与量・効果・副作用記述に一次/準一次ソースを明記する。
> **単位は onabotulinumtoxinA（BOTOX®）の Unit (U) を基準**とする。abobotulinumtoxinA（Dysport®）は約 2.5–3 倍、incobotulinumtoxinA（Xeomin®）はほぼ 1:1。

---

## 0. 主要参考ソース（一次/準一次）

| 略号 | ソース |
|---|---|
| **FDA-PI** | BOTOX Cosmetic Prescribing Information (Allergan/AbbVie). https://www.rxabbvie.com/pdf/botox-cosmetic_pi.pdf |
| **CARR2004** | Carruthers JA, Carruthers JD et al. Consensus recommendations on the use of botulinum toxin type A in facial aesthetics. Plast Reconstr Surg. 2004;114(6 Suppl):1S-22S. |
| **NEWLUX2024** | Korean Expert Consensus on the Cosmetic Use of BoNT-A (NEWLUX). 2024. PMC11861028. |
| **ALLU2024** | International Consensus Recommendations on Aesthetic Usage of Alluzience. Aesthet Surg J. 2024;44(2):192. PMC10790960. |
| **PTOSIS-REV** | Botulinum toxin–induced blepharoptosis: Anatomy, etiology, prevention. PMC9290925. |
| **MGT-PTOSIS** | Management of Ptosis. JCAD. PMC5300727. |

> **重要：すべての投与量は健常成人女性（onabotulinumtoxinA）を基準とした参考値。患者個別の筋量・骨格・既往により大きく変動する。アプリ内では必ず「医師判断が前提」と明記する。**

---

## 1. 投与部位ごとのナレッジ

### 1-1. 眉間（Glabellar Lines / 縦じわ "11" sign）

#### 解剖
- **主要筋**: 皺眉筋（corrugator supercilii）、鼻根筋（procerus）
- **共働筋**: 眉毛下制筋（depressor supercilii）、眼輪筋上内側線維
- 各筋は近接し連動するため、1筋への注入が周辺筋に波及する [NEWLUX2024]

#### 標準投与量（FDA-PI 公式）
- **合計 20 U / 5 ポイント**
- 皺眉筋：左右各 2 ポイント × 4 U
- 鼻根筋：中央 1 ポイント × 4 U
- [FDA-PI]

#### コンセンサス幅
- 男性は筋肉量が多く 30–40 U
- 軽症女性は 15 U まで減量可 [CARR2004, NEWLUX2024]

#### 効果
- 効果発現：3–7 日
- 最大効果：14 日
- 持続：3–4 ヶ月
- しわパターン分類（NEWLUX2024 韓国コンセンサス）：
  - **U型**（中央のみ）：procerus 主体 → 中央寄り注入
  - **V型**（八の字）：corrugator 主体 → 内側 corrugator 重視
  - **コンバージング型**：両方
  - **オメガ型**：複雑、症例ごとに調整

#### 主な合併症
| 合併症 | 原因 | 予防策 |
|---|---|---|
| **眼瞼下垂（blepharoptosis）** | 上眼瞼挙筋（LPS）への波及 | 眉毛中央上 1cm 未満への注入を避ける。lateral corrugator は眼窩上縁から 1cm 以上上に。注入量を必要最小限に。[FDA-PI] |
| **眉毛下垂（brow ptosis）** | 前頭筋下部への波及 | 眉毛直上には打たない。lateral fibers の評価重要 [NEWLUX2024] |
| **Spock brow / Mr.Spock 眉** | 内側のみ抑制で外側挙筋が優位に | 外側 frontalis にも 1–2 U 追加注入 |

#### 危険ゾーン（アプリ実装上の重要ポイント）
- **絶対禁忌ゾーン**: 眉毛中央直上 1cm 以内（LPS への拡散リスク）
- **慎重ゾーン**: 眼窩上縁から 1cm 以内（特に外側）
- **理想深度**: 筋層内（皮下脂肪より深く）

---

### 1-2. 額の横じわ（Horizontal Forehead Lines）

#### 解剖
- **唯一の筋**: 前頭筋（frontalis）— 眉毛挙上の唯一の筋
- 前頭筋を完全に止めると **眉毛が必ず下がる**

#### 標準投与量
- **合計 10–20 U / 4–8 ポイント**
- [ALLU2024 で 4–8 ポイント推奨]
- 軽症：8–12 U
- 通常：12–20 U
- 男性：20–30 U（筋肉量多い）

#### 注入の鉄則
- **眉毛から最低 2cm 上（一般的に 2.5–3cm 上が安全）**
- 横一列ではなく "V" または "M" パターンで自然な挙動を残す
- **眉間と必ずセット**で打つ（前頭筋だけ止めると、glabellar complex が拮抗を失い眉毛がより下がる）[CARR2004]

#### 主な合併症
| 合併症 | 原因 | 発生率 |
|---|---|---|
| **眉毛下垂（brow ptosis）** | 前頭筋下部の過抑制、低位置注入 | 経験豊富 <1%、未熟 5.4% [南ジャージー2024] |
| **重い額・違和感** | 過量投与 | 用量依存 |
| **代償性しわ（Mephisto/Spock）** | 中央のみ抑制で外側が動く | 注入パターン不均一 |

#### 危険ゾーン
- **絶対禁忌**: 眉毛から 1.5cm 以内
- **推奨深度**: 筋層内、ただし表在性に近い

---

### 1-3. 目尻（Crow's Feet / カラスの足跡）

#### 解剖
- **主要筋**: 眼輪筋外側部（orbicularis oculi, lateral orbital portion）

#### 標準投与量
- **片側 7.5–15 U / 2–3 ポイント**（合計 15–30 U）[NEWLUX2024]
- ALLU2024：片側 3 ポイント推奨

#### 注入位置
- **外眼角（lateral canthus）から 1–1.5cm 外側**
- 眼窩外側縁の **外側** に必ず留める
- 上下にポイントを配置（C 字状）

#### 主な合併症
| 合併症 | 原因 | 予防策 |
|---|---|---|
| **下眼瞼下垂（lower lid ptosis）** | 眼輪筋眼瞼部への過量注入 | パルペブラル部分を避ける、低用量 |
| **頬部下垂・笑顔の非対称** | 大頬骨筋に近すぎる注入（外眼角下 1cm 以内） | 注入位置を眼窩外側縁の外側のみに |
| **複視（diplopia）** | 外直筋への深部拡散（極稀） | 浅い皮内/筋内注入 |
| **ドライアイ悪化** | 涙液ポンプ機能低下 | 既存ドライアイ患者は減量 [IAPAM] |

#### 危険ゾーン
- **絶対禁忌**: 眼窩骨縁の内側（眼内・眼瞼内側）
- **慎重ゾーン**: 頬骨上、外眼角の下方 1cm 以内
- **推奨深度**: 表在性（皮内〜浅筋層、1–2mm）

---

### 1-4. バニーライン（Bunny Lines / 鼻根の斜めじわ）

#### 解剖
- **主要筋**: 鼻筋横部（nasalis, transverse part）

#### 標準投与量
- 左右各 **2–4 U**（合計 4–8 U）[ALLU2024]
- 1ポイント/側

#### 注入位置
- 鼻骨の側方斜面、外眼角下を結ぶ線より上
- 鼻翼挙筋（LLSAN）に拡散しないよう注意

#### 合併症
- LLSAN への拡散 → 上唇下垂・笑顔の非対称（"Joker smile"）
- 下方への拡散 → 鼻翼が下がる・口角が上がらない

#### 危険ゾーン
- **絶対禁忌**: 鼻翼基部より下
- **理想ゾーン**: 鼻側壁の上 2/3

---

### 1-5. ガミースマイル（Gummy Smile / 笑った時に歯茎が見える）

#### 解剖
- **主要筋**: 上唇鼻翼挙筋（levator labii superioris alaeque nasi, LLSAN）
- 共働: 上唇挙筋（levator labii superioris）、小頬骨筋

#### 標準投与量
- 左右各 **1–2.5 U**（合計 2–5 U）[ALLU2024]
- 1 ポイント/側、Yonsei point 推奨

#### 注入位置
- "Yonsei point": 鼻翼外側基部、鼻唇溝、人中側方を結ぶ三角形の中心
- 浅く（1–2mm）注入

#### 合併症
- **上唇下垂・違和感**：過量で発音障害、口角の動きの低下
- **非対称な笑顔**：左右差が出やすい
- **長い上唇に見える**

#### 危険ゾーン
- **絶対禁忌**: 鼻唇溝より外側（口輪筋へ拡散）

---

### 1-6. リップフリップ／口周りのしわ（Lip Flip / Perioral Lines）

#### 解剖
- **主要筋**: 口輪筋（orbicularis oris）

#### 標準投与量
- **総量 4–8 U**（4 ポイント、各 1–2 U）[CARR2004]
- リップフリップのみ：上唇に 2–4 U
- バーティカルリップライン全体：上下唇に各 4 U

#### 注入位置
- 唇の赤縁直上（vermilion border）に皮内注入
- 口角から最低 5mm 内側

#### 合併症
- **発音障害**（特に "p", "b", "m"）— 用量依存、過量で確実に出る
- **ストロー使用困難・飲み物こぼす**
- **非対称な笑顔**（口角下制筋への拡散）
- **口唇閉鎖不全**

#### 危険ゾーン
- **絶対禁忌**: 口角部、口角から 5mm 以内
- **量の上限**: 1ポイント 2U を超えない

---

### 1-7. オトガイ筋（Mentalis / 顎の梅干しじわ）

#### 解剖
- **主要筋**: オトガイ筋（mentalis）

#### 標準投与量
- **合計 4–10 U**（中央 1–2 ポイント）[CARR2004]
- 中央 1 ポイント 5 U が標準

#### 注入位置
- オトガイ筋の正中、下顎骨の前面、最も突出した点
- 必ず正中に留める（外側に拡散すると下唇下制筋に影響）

#### 合併症
- **下唇のコントロール障害**
- **下唇前突感の喪失**
- **非対称な唇の動き**

#### 危険ゾーン
- **絶対禁忌**: 正中から 1cm 以上外側

---

### 1-8. マリオネットライン（口角下制筋 / DAO）

#### 解剖
- **主要筋**: 口角下制筋（depressor anguli oris, DAO）
- 解剖学的に下唇下制筋（depressor labii inferioris, DLI）と隣接

#### 標準投与量
- 左右各 **2–5 U**（合計 4–10 U）[ALLU2024]

#### 注入位置
- 下顎縁、口角から下 1cm、外側 1cm の点（"jowl line"上）
- **DLI を避けるため、十分に外側に**

#### 合併症
- **DLI への拡散 → 下唇の非対称、笑顔の歪み（最頻）**
- **口角の左右差**

#### 危険ゾーン
- **絶対禁忌**: 口角直下、内側寄り（DLI 領域）

---

### 1-9. エラ（咬筋 / Masseter Hypertrophy）

#### 解剖
- **主要筋**: 咬筋（masseter）

#### 標準投与量
- **片側 25–50 U**（合計 50–100 U）[ALLU2024]
- 通常初回：片側 30 U、3 ポイント
- 強い筋肥大：片側 50 U まで

#### 注入位置
- 下顎角を起点とした安全三角形（"masseter safety zone"）内
- 咬筋前縁・上縁・耳珠線の内側に必ず留める
- 深部筋層（皮下から 1cm 以上）

#### 合併症
- **咀嚼力低下**（用量依存、通常 4–6 週で回復）
- **頬部陥没（"hourglass deformity"）**：表在筋への注入で頬がこける
- **表情筋への拡散**（笑筋・大頬骨筋）→ 笑顔の非対称
- **逆説的膨隆（paradoxical bulging）**：浅層線維のみ抑制、深層が代償性肥大
- **誤嚥・発音の違和感**（稀）

#### 危険ゾーン
- **絶対禁忌**: 咬筋前縁の前方（笑筋・頬筋へ拡散）
- **理想深度**: 5–10mm（深部）

---

### 1-10. 広頸筋（Platysma / 首の縦じわ・ネックバンド）

#### 解剖
- **主要筋**: 広頸筋（platysma）

#### 標準投与量
- **総量 25–60 U**（バンドあたり 10–20 U、3–6 ポイント）[CARR2004]
- 高用量レジメンは注意

#### 合併症
- **嚥下困難（dysphagia）— 重大、深部注入で発生**
- **頸部筋力低下**
- **発音困難**

> 上級者向け部位。アプリでは「医師専用モード」で扱う想定。

---

## 2. 投与量と効果の関係（Dose–Response）

### 一般原則
- **皺改善は対数的に飽和**: 通常用量の 2 倍にしても効果は 1.2–1.3 倍程度
- **持続期間は用量にやや比例**: 高用量で +1 ヶ月程度延長
- **副作用は用量に比例**: 過量で副作用が急増（特に拡散性合併症）

### 効果発現タイムライン（共通）
| 時期 | 状態 |
|---|---|
| 1–3 日 | 効果開始（個人差あり） |
| 7–10 日 | 60–80% 効果 |
| **14 日** | **最大効果（評価のゴールデンタイム）** |
| 3 ヶ月 | 効果ピーク維持 |
| 4 ヶ月 | 効果減弱開始 |
| 4–6 ヶ月 | リタッチ時期 |

### 抗体産生・耐性（neutralizing antibody resistance）
- 高頻度・高用量・長期使用で抗体産生 → 効果減弱
- 治療間隔 3 ヶ月以上、必要最小用量を守る

---

## 3. 副作用一覧（重大度別）

### A. 美容的合併症（多くは 4–8 週で自然軽快）
| 合併症 | 発生率 | 主因 |
|---|---|---|
| 眉毛下垂 | 1–5% | 前頭筋下部への注入 |
| 眼瞼下垂 | 1–5%（経験者 <1%） | LPS への拡散 |
| 表情の左右非対称 | 5–15% | 用量・位置の不均一 |
| Spock brow | 5–10% | 中央のみ抑制 |
| 頬部下垂 | 稀 | crow's feet の低位置注入 |

### B. 局所合併症（24–72時間で軽快）
- 内出血、発赤、頭痛、注射部位痛、軽度浮腫

### C. 重大合併症（医師管理必須）
- 嚥下困難（platysma 注入時）
- 全身性筋力低下（高用量）
- アナフィラキシー（極稀）
- 視力障害（眼周囲の極端な誤注入時）

---

## 4. 患者選択：禁忌・慎重投与

### 絶対禁忌
- ボツリヌス毒素アレルギー既往
- 注入部位の活動性感染
- 神経筋接合部疾患（重症筋無力症、Lambert-Eaton 症候群、ALS）
- 妊娠・授乳中

### 相対禁忌・慎重
- アミノグリコシド系・キノロン系・カルシウム拮抗薬使用中
- 出血傾向（抗凝固薬・抗血小板薬）
- ドライアイ（crow's feet 慎重）
- 重度の眼瞼皮膚弛緩（既存 brow ptosis）
- 抗体保有患者

---

## 5. シミュレーションアプリでの応用ロジック

### 5-1. 各部位のパラメータ化

各部位（zone）について以下を定義：

```
{
  zoneId: "glabella",
  targetMuscle: "corrugator + procerus",
  idealDoseRange: { min: 15, max: 30, optimal: 20 },
  idealPoints: [
    { x, y, recommendedUnits: 4, depth: "intramuscular" },
    ...×5
  ],
  safeZone: <polygon>,
  dangerZones: [
    {
      polygon: <near LPS>,
      effect: "eyelid_ptosis",
      risk: "high"
    },
    {
      polygon: <lateral lower frontalis>,
      effect: "brow_ptosis",
      risk: "moderate"
    }
  ],
  improvementTargets: ["glabellar_lines"],
  doseResponseCurve: f(totalDose) → improvement%,
}
```

### 5-2. シミュレーション計算アルゴリズム

```
入力: ユーザーが配置した injection points [{x, y, units}, ...]

ステップ1: 各部位への寄与計算
  for each zone:
    relevantPoints = points within zone or affecting zone via diffusion
    totalEffectiveDose = Σ(units × distanceWeight × depthFactor)
    
ステップ2: しわ改善率計算
  improvement = sigmoid((totalEffectiveDose - threshold) / scale)
  // 例: glabella 20U で 90%, 5U で 30%

ステップ3: 副作用リスク計算
  for each dangerZone:
    proximityRisk = points内のpointsがzoneにどれだけ近いか
    doseRisk = 用量過多か
    sideEffectProbability = combine(proximity, dose, anatomy)
  
ステップ4: 視覚化
  - しわ強度を opacity で減衰
  - 副作用が triggered なら overlay（眼瞼下垂レイヤー、眉毛下降レイヤーなど）
```

### 5-3. シナリオプリセット（教育用）

- ✅ 「適切な眉間注入」（20U、5点）
- ❌ 「眉毛直上に打ちすぎ」 → 眼瞼下垂発生
- ❌ 「外側 corrugator のみ」 → Spock brow
- ❌ 「額に大量注入、眉間なし」 → 重度眉毛下垂
- ❌ 「Crow's feet 低位置注入」 → 頬部下垂
- ❌ 「Masseter 表在注入」 → 笑顔の非対称
- ❌ 「リップフリップ過量（5U×4）」 → 発音障害

---

## 6. 法的・倫理的注意（YMYL対応）

このアプリは **教育目的** であり、以下を必ず明記：

1. **個別治療判断を代替しない**：実際の投与は医師の診察と判断による
2. **シミュレーションは確率的予測**：個別の解剖・既往により実際の結果は異なる
3. **副作用情報は完全ではない**：詳細は医師相談、添付文書参照
4. **症例画像扱い**：医療広告ガイドライン準拠（治療内容・期間・費用・副作用記載必須）
5. **効果断定表現禁止**：「必ず治る」「100%安全」NG

---

## 7. 今後拡張すべきナレッジ（将来TODO）

- アジア人 vs 白人の corrugator サイズ差（[NEWLUX2024]）
- 男女別投与量
- 年齢別最適化（20代予防 / 50代深いしわ）
- BoNT 製剤間換算（onabot / abobot / incobot / prabotulinumtoxin / daxibotulinumtoxin）
- 抗体保有患者対応
- 直近の RCT・システマティックレビュー追加
