import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ClinicalApp from "../src/ClinicalApp";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<ClinicalApp />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
function button(label: string) {
  const found = Array.from(container.querySelectorAll("button")).find(b => b.textContent?.trim() === label);
  if (!found) throw new Error("Missing button: " + label);
  return found;
}
function click(label: string) { act(() => button(label).click()); }
function face(before: boolean) { return container.querySelector<SVGSVGElement>(`[data-face="${before ? "before" : "after"}"]`)!; }
function setRange(id: string, value: number) {
  const range = container.querySelector<HTMLInputElement>("#" + id)!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => { setter.call(range, String(value)); range.dispatchEvent(new Event("input", { bubbles: true })); range.dispatchEvent(new Event("change", { bubbles: true })); });
}
describe("Clinical interactions", () => {
  it("opens with paired faces and changes the after face with quantity, preserving the before face", () => {
    const original = face(true).innerHTML;
    click("効きにくい例");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("効きにくい例");
    const weak = Number(face(false).dataset.relaxation);
    click("効きすぎの例");
    expect(Number(face(false).dataset.relaxation)).toBeGreaterThan(weak);
    expect(Number(face(false).querySelector<SVGGElement>('[data-feature="right-eye"]')?.dataset.droop)).toBeGreaterThan(0);
    expect(face(true).innerHTML).toBe(original);
    setRange("amount-range", 0);
    expect(face(false).dataset.relaxation).toBe("0");
    expect(container.textContent).toContain("量が0のため");
  });
  it("links the quick depth control to muscle mismatch without hiding retained wrinkles", () => {
    const select = container.querySelector<HTMLSelectElement>('[aria-label="比較する針先の層"]')!;
    act(() => { select.value = "superficial"; select.dispatchEvent(new Event("change", { bubbles: true })); });
    expect(container.textContent).toContain("目的筋には乏しく");
    expect(container.textContent).toContain("眉が下がる例");
    expect(Number(face(false).dataset.relaxation)).toBeLessThan(.35);
    expect(button("浅い筋層表層の筋線維").getAttribute("aria-pressed")).toBe("true");
  });
  it("keeps depth fixed across medial/lateral comparison and resets exposure on a new region", () => {
    click("外側");
    expect(container.textContent).toContain("目的筋には乏しく");
    click("02筋肉と皮膚");
    act(() => container.querySelector<SVGGElement>('[aria-label="目尻を選択"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(button("この条件で打った変化を見る").getAttribute("aria-pressed")).toBe("false");
    expect(container.textContent).toContain("眼輪筋・外側部");
  });
  it("removes both relaxation and ptosis immediately when switching to day zero", () => {
    click("効きすぎの例");
    click("直後");
    expect(face(false).dataset.relaxation).toBe("0");
    expect(face(false).querySelector<SVGGElement>('[data-feature="right-eye"]')?.dataset.droop).toBe("0");
    expect(container.textContent).toContain("筋弛緩は、まだ見えない");
  });
  it("opens region enlargement and section comparison, then resets all view controls", () => {
    const normal = face(false).getAttribute("viewBox");
    click("部位を拡大");
    expect(face(false).getAttribute("viewBox")).not.toBe(normal);
    click("03層と深度");
    click("浅い筋層と深い筋層を並べて比較");
    expect(container.querySelector(".section-comparison")?.querySelectorAll("svg")).toHaveLength(2);
    click("リセット");
    expect(button("01顔と変化").getAttribute("aria-pressed")).toBe("true");
    expect(button("内側").getAttribute("aria-pressed")).toBe("true");
    expect(face(false).getAttribute("viewBox")).toBe(normal);
    expect(container.querySelector(".section-comparison")).toBeNull();
    expect(container.querySelector<HTMLInputElement>("#amount-range")?.value).toBe("100");
  });
  it("shares expression strength across the two faces", () => {
    click("02額");
    click("動きが弱まる例");
    setRange("expression-range", 0);
    expect(face(true).querySelector<SVGGElement>('[data-feature="brows"]')?.dataset.shift).toBe("0");
    expect(face(false).querySelector<SVGGElement>('[data-feature="brows"]')?.dataset.shift).toBe("0");
    setRange("expression-range", 100);
    const before = Number(face(true).querySelector<SVGGElement>('[data-feature="brows"]')?.dataset.shift);
    const after = Number(face(false).querySelector<SVGGElement>('[data-feature="brows"]')?.dataset.shift);
    expect(Math.abs(after)).toBeLessThan(Math.abs(before));
  });
});

function numericInput(label: string) { return container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!; }
function enter(label: string, value: string) {
  const input = numericInput(label);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  act(() => { setter.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); });
}
describe("Vista calculator interactions", () => {
  it("updates mL with dilution while preserving U and keeping the teaching face independent", () => {
    const original = face(false).innerHTML;
    click("20 Uの入力例");
    expect(container.querySelector('[data-testid="vista-point-volume"]')?.textContent).toBe("0.1 mL");
    click("2.5 mL");
    expect(numericInput("この部位の総量 U").value).toBe("20");
    expect(numericInput("1点あたりの投与量 U").value).toBe("4");
    expect(container.querySelector('[data-testid="vista-point-volume"]')?.textContent).toBe("0.2 mL");
    expect(container.querySelector('[data-issue="volume-high"]')).not.toBeNull();
    expect(face(false).innerHTML).toBe(original);
  });
  it("keeps per-point and total U synchronized and clears stale results on invalid entry", () => {
    enter("1点あたりの投与量 U", "4");
    expect(numericInput("この部位の総量 U").value).toBe("20");
    enter("分割する点数", "4");
    expect(numericInput("1点あたりの投与量 U").value).toBe("5");
    expect(container.querySelector('[data-issue="points"]')).not.toBeNull();
    enter("生理食塩液の量 mL", "");
    expect(container.querySelector('[data-testid="vista-total-volume"]')?.textContent).toBe("— mL");
    expect(container.querySelector('[data-testid="vista-concentration"]')?.textContent).toContain("—");
    click("リセット");
    expect(numericInput("この部位の総量 U").value).toBe("10");
    expect(numericInput("分割する点数").value).toBe("5");
  });
  it("loads masseter units and concentration with explicit bilateral scope", () => {
    click("09エラ");
    expect(container.querySelector<HTMLSelectElement>('[aria-label="ボトックスビスタの規格"]')?.value).toBe("100");
    expect(numericInput("この部位の総量 U").value).toBe("48");
    click("72 Uの入力例");
    expect(container.querySelector('[data-testid="vista-point-volume"]')?.textContent).toBe("0.3 mL");
    expect(container.querySelector('[data-testid="vista-total-volume"]')?.textContent).toBe("1.8 mL");
    expect(container.querySelector('[data-issue="volume-high"]')).toBeNull();
    expect(container.querySelector('.vista-scope')?.textContent).toContain("左右の合計");
  });
  it("does not invent a reference dose for off-label anatomy regions", () => {
    click("02額");
    expect(numericInput("この部位の総量 U").value).toBe("");
    expect(container.querySelector(".vista-reference")).toBeNull();
    enter("この部位の総量 U", "10");
    expect(container.querySelector('[data-issue="off-label"]')?.textContent).toContain("国内適応外");
  });
  it("shows only observed trial dose groups without interpolating an entered intermediate dose", () => {
    enter("この部位の総量 U", "15");
    const trial = container.querySelector(".vista-trial")!;
    expect(trial.textContent).toContain("入力した15 Uの試験値は、この表にはありません");
    expect(trial.textContent).toContain("38 / 44例");
    expect(trial.querySelector(".is-selected")).toBeNull();
  });
});
