# CLAUDE.md — Claude Code 用プロジェクト指示書

> このファイルは Claude Code がこのリポジトリで作業を始めるとき、最初に読むべき指示書です。

---

## このプロジェクトは何か

**ボトックス（A型ボツリヌス毒素）のシミュレーター Web アプリ**を作っています。
ユーザーが顔のイラストに注入点を配置し、用量を指定すると、
- しわが改善する様子（適切な場合）
- 眼瞼下垂・眉毛下垂などの副作用が発生する様子（不適切な場合）
が SVG イラストの変化として可視化されます。

**ターゲットユーザー**: 美容皮膚科スタッフ研修、医師トレーニング、患者カウンセリング補助。

---

## 必読ドキュメント（作業前に必ず目を通す）

| ファイル | 内容 | 重要度 |
|---|---|---|
| `docs/BOTOX_KNOWLEDGE.md` | 投与量・部位・副作用のエビデンスベース・ナレッジ。**コードに書く数値はすべてここから引く** | ★★★ |
| `docs/DESIGN.md` | アーキテクチャ・UI/UX・データモデル全体像 | ★★★ |
| `src/types/botox.ts` | 全型定義。データを書く前に必ず読む | ★★★ |
| `src/data/zones.ts` | 「眉間」のリファレンス実装。他部位を追加するときの雛形 | ★★ |

---

## 技術スタック

- React 18 + TypeScript（strict mode）
- Vite
- Tailwind CSS
- Zustand（軽量ストア）
- Framer Motion（アニメーション）
- Vitest（テスト）

---

## 作業の優先順位

### Phase 1: MVP（最優先）
1. `npm install` で依存をインストール
2. `src/data/zones.ts` を読んで、眉間（glabella）の実装を理解
3. `src/engine/simulate.ts` の TODO を埋める
4. `src/components/FaceCanvas.tsx` を実装（最低限：眉間に注入点を置けるところまで）
5. `src/components/ResultPanel.tsx` でしわ改善 % と副作用確率を表示

### Phase 2: 部位を増やす
ナレッジ集（`docs/BOTOX_KNOWLEDGE.md`）に従って、以下の順で追加：
1. 額（forehead）— 眉間とのコンビ運用が必須なので2番目
2. 目尻（crow's feet）— 別ゾーン、独立性高く実装しやすい
3. バニーライン（bunny lines）
4. ガミースマイル（gummy smile）
5. リップフリップ
6. オトガイ筋（mentalis）
7. マリオネット（DAO）
8. エラ（masseter）— 専用視点（横顔）が必要かも
9. 広頸筋（platysma）— 上級モード

### Phase 3: 完成度
- プリセットシナリオ実装（`src/data/presets.ts`）
- モバイル最適化
- 多言語化（i18n）
- E2E テスト

---

## 守るべきルール

### ★ 医学的正確性は最優先
- 投与量・部位の数値は **必ず `docs/BOTOX_KNOWLEDGE.md` のエビデンスソース** から引く
- 数値を変える際は、ソースとなる引用も併記する
- 当てずっぽうの数値（"だいたい X 単位くらい"）は絶対に書かない
- **不明な場合は実装を止めて確認する**

### ★ YMYL（医療YMYL）対応
- 「必ず治る」「100% 安全」など効果断定 NG
- アプリ内に常時ディスクレーマーを表示
- 「医療行為の代替ではない」「医師相談前提」を必ず明示

### ★ TypeScript strict
- `any` 使用禁止
- 型定義は `src/types/botox.ts` に集約
- 新しい型を作るときは既存の命名規則に従う

### ★ engine層は pure
- `src/engine/*.ts` は副作用フリー（DOM 操作、API 呼び出し、ランダム値はテストでモック可能に）
- 単体テストで 100% カバー目標

### ★ コミット粒度
- 機能単位で小さく
- ナレッジ更新と実装更新は分けてコミット

---

## やってはいけないこと

- 🚫 `docs/BOTOX_KNOWLEDGE.md` の数値を「最適化のため」に勝手に変える
- 🚫 副作用の確率を「軽く見せる」ようなデフォルト値設定
- 🚫 患者個人情報を扱う機能を追加する（ローカルストレージ含め慎重に）
- 🚫 AI画像生成で顔イラストを作る（解剖学的正確性が担保できない）
- 🚫 ナレッジ更新をエビデンスなしで行う

---

## ナレッジ追加・更新ワークフロー

新しい部位や副作用情報を追加する場合：

1. `docs/BOTOX_KNOWLEDGE.md` にエビデンス付きで追記
2. `src/types/botox.ts` の型を必要に応じて拡張
3. `src/data/zones.ts` に zone を追加
4. `src/engine/simulate.ts` に副作用判定を追加（必要なら）
5. テストを追加
6. ドキュメントの参照リンクを Claude.md に反映

**順番厳守。コードからエビデンスを書くな。**

---

## 開発コマンド

```bash
npm install         # 依存インストール
npm run dev         # 開発サーバー起動
npm run build       # 本番ビルド
npm run test        # 単体テスト
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
```

---

## 質問・判断に迷った時の優先順位

1. `docs/BOTOX_KNOWLEDGE.md` を読み返す
2. `docs/DESIGN.md` を確認する
3. それでも不明なら、ユーザー（クリニック側）に確認する：
   - 「この部位の投与量レンジ、コンセンサスと違いますがどちらを採用しますか？」
   - 「この副作用の発生率、ソースが見つからないので確認お願いします」

**勝手に決めない。医療データだから。**

---

## 起動時に Claude Code が最初にすべきこと

```
1. CLAUDE.md（本ファイル）を読む
2. docs/BOTOX_KNOWLEDGE.md を全文読む
3. docs/DESIGN.md を全文読む
4. src/types/botox.ts を読む
5. 現在の進捗（package.json の status か git log）を確認
6. ユーザーに「次の作業候補」を提案する
```
