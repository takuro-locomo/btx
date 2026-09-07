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
  it("opens with paired faces and changes the after face with effect examples, preserving the before face", () => {
    const original = face(true).innerHTML;
    click("効きにくい例");
    expect(container.querySelector('[role="status"]')?.textContent).toContain("効きにくい例");
    const weak = Number(face(false).dataset.relaxation);
    click("効きすぎの例");
    expect(Number(face(false).dataset.relaxation)).toBeGreaterThan(weak);
    expect(Number(face(false).querySelector<SVGGElement>('[data-feature="right-eye"]')?.dataset.droop)).toBeGreaterThan(0);
    expect(face(true).innerHTML).toBe(original);
    click("注入後の変化を表示中");
    expect(face(false).dataset.relaxation).toBe("0");
    expect(container.textContent).toContain("まだ作用を表示していません");
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
    expect(container.querySelector("#amount-range")).toBeNull();
    expect(container.querySelector(".vista-panel")).toBeNull();
    expect(container.querySelector<HTMLInputElement>('input[type="number"]')).toBeNull();
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
