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

describe("Clinical interactions", () => {
  it("keeps depth fixed across medial/lateral comparison and resets exposure on a new region", () => {
    click("作用のイメージを重ねる");
    expect(button("作用のイメージ ON").getAttribute("aria-pressed")).toBe("true");
    click("外側");
    expect(container.textContent).toContain("表情変化は描画していません");
    act(() => container.querySelector<SVGGElement>('[aria-label="目尻を選択"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    expect(button("作用のイメージを重ねる").getAttribute("aria-pressed")).toBe("false");
    expect(container.textContent).toContain("眼輪筋・外側部");
  });
  it("opens depth comparison, changes time and returns to the original state", () => {
    click("03層と深度");
    click("浅い筋層と深い筋層を並べて比較");
    expect(container.querySelector(".section-comparison")?.querySelectorAll("svg")).toHaveLength(2);
    click("直後");
    expect(container.textContent).toContain("筋弛緩は、まだ見えない");
    click("リセット");
    expect(button("02筋肉と皮膚").getAttribute("aria-pressed")).toBe("true");
    expect(button("内側").getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector(".section-comparison")).toBeNull();
  });
});
