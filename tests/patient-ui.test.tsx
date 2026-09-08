import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PatientApp from "../src/PatientApp";
import { PATIENT_CONCERNS } from "../src/data/patientConsultation";

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<PatientApp />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
function click(label: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (node) => node.textContent?.trim() === label,
  );
  if (!button) throw new Error("Missing button: " + label);
  act(() => button.click());
}
function choose(id: string) {
  const concern = PATIENT_CONCERNS.find((item) => item.id === id)!;
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>(".concern-button"),
  ).find((node) => node.textContent?.includes(concern.label))!;
  act(() => button.click());
}
function afterFace() {
  return container.querySelector<SVGSVGElement>('[data-face="after"]')!;
}
function price() {
  return container.querySelector('[data-testid="treatment-price"]')!
    .textContent;
}

describe("Patient consultation", () => {
  it("shows the four requested answers without dose, depth or concentration controls", () => {
    expect(container.querySelectorAll(".concern-button")).toHaveLength(11);
    expect(
      container.querySelector('[data-treatment-area="glabella"]'),
    ).not.toBeNull();
    expect(price()).toContain("17,600円");
    expect(
      container.querySelector(".patient-effect-card")?.textContent,
    ).toContain("眉間の縦じわ");
    expect(
      container.querySelector(".patient-region-risks")?.textContent,
    ).toContain("まぶたが下がる");
    expect(
      container.querySelectorAll(
        "input, select, .vista-panel, .clinical-section",
      ),
    ).toHaveLength(0);
    expect(
      container.querySelector(".patient-disclaimer")?.textContent,
    ).toContain("予測ではありません");
  });
  it("updates location, effects and risks for each concern", () => {
    for (const concern of PATIENT_CONCERNS) {
      choose(concern.id);
      expect(container.querySelector("#result-heading")?.textContent).toBe(
        concern.label,
      );
      expect(
        container.querySelector(`[data-treatment-area="${concern.id}"]`),
      ).not.toBeNull();
      expect(container.querySelector(".patient-main-copy")?.textContent).toBe(
        concern.expected,
      );
      expect(
        container.querySelector(".patient-region-risks")?.textContent,
      ).toContain(concern.risks[0]);
    }
  });
  it("does not carry a one-area discount into jaw, gummy or unconfirmed prices", () => {
    choose("bunny");
    expect(container.querySelector(".patient-discount")?.textContent).toContain(
      "11,000円",
    );
    expect(price()).toContain("17,600円");
    choose("dao");
    expect(price()).toContain("33,000円");
    expect(container.querySelector(".patient-discount")).toBeNull();
    choose("masseter");
    expect(price()).toContain("52,800円");
    expect(container.querySelector(".patient-discount")).toBeNull();
    choose("gummy");
    expect(price()).toContain("22,000円");
    expect(
      container.querySelector(".patient-price-scope")?.textContent,
    ).toContain("2回セット");
    expect(container.querySelector(".patient-discount")).toBeNull();
    choose("neck");
    expect(price()).toBe("診察時にご案内");
    expect(container.querySelector(".patient-discount")).toBeNull();
  });
  it("compares limited and adverse examples without altering the before face or price", () => {
    const before = container.querySelector('[data-face="before"]')!.innerHTML;
    const expected = Number(afterFace().dataset.relaxation);
    click("変化が少ない例");
    expect(Number(afterFace().dataset.relaxation)).toBeLessThan(expected);
    click("副作用の例");
    expect(
      Number(
        afterFace().querySelector<SVGGElement>('[data-feature="right-eye"]')
          ?.dataset.droop,
      ),
    ).toBeGreaterThan(0);
    expect(container.querySelector('[data-face="before"]')!.innerHTML).toBe(
      before,
    );
    expect(price()).toContain("17,600円");
    click("期待できる変化");
    expect(
      afterFace().querySelector<SVGGElement>('[data-feature="right-eye"]')
        ?.dataset.droop,
    ).toBe("0");
  });
  it("clears adverse mode and restores the close-up when choosing a different concern", () => {
    click("顔全体に戻す ↗");
    click("副作用の例");
    choose("forehead");
    expect(afterFace().getAttribute("viewBox")).toBe("140 82 120 88");
    expect(container.querySelector(".showing-adverse")).toBeNull();
    expect(container.querySelector(".patient-example-message")).toBeNull();
    expect(
      container.querySelectorAll('.concern-button[aria-pressed="true"]'),
    ).toHaveLength(1);
  });
  it("explains non-visible neck symptoms instead of simulating a swallowing outcome", () => {
    choose("neck");
    click("副作用の例");
    expect(
      container.querySelector(".patient-unseen-risk")?.textContent,
    ).toContain("飲み込みにくい");
    expect(afterFace()).toBeNull();
    expect(container.querySelector(".patient-urgent")?.textContent).toContain(
      "速やかに",
    );
    click("期待できる変化");
    expect(afterFace()).not.toBeNull();
  });
  it("links microbotox scope to its price and skin illustration, clearing side effects on a new scope", () => {
    choose("micro");
    expect(price()).toContain("27,500円");
    expect(container.querySelector(".patient-discount")).toBeNull();
    expect(afterFace().querySelector(".clinical-features")).toBeNull();
    expect(
      container.querySelectorAll('[data-face="before"] [data-treatment-area="micro"] ellipse'),
    ).toHaveLength(2);
    const normalIntensity = Number(
      afterFace().querySelector<SVGGElement>('[data-skin-example="micro"]')
        ?.dataset.intensity,
    );
    click("変化が少ない例");
    expect(
      Number(
        afterFace().querySelector<SVGGElement>('[data-skin-example="micro"]')
          ?.dataset.intensity,
      ),
    ).toBeGreaterThan(normalIntensity);
    click("副作用の例");
    expect(
      afterFace().querySelector('[data-feature="skin-bruising"]'),
    ).not.toBeNull();
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(".patient-variants button"),
    );
    act(() =>
      buttons.find((node) => node.textContent?.startsWith("額＋鼻"))!.click(),
    );
    expect(price()).toContain("33,000円");
    expect(
      container.querySelector(".patient-price-scope")?.textContent,
    ).toContain("額＋鼻");
    expect(
      afterFace().querySelector('[data-feature="skin-bruising"]'),
    ).toBeNull();
    act(() =>
      buttons.find((node) => node.textContent?.startsWith("全顔"))!.click(),
    );
    expect(price()).toContain("44,000円");
    expect(
      container.querySelectorAll('[data-face="before"] [data-treatment-area="micro"] ellipse'),
    ).toHaveLength(5);
    choose("glabella");
    expect(afterFace().querySelector('[data-skin-example="micro"]')).toBeNull();
    choose("micro");
    expect(price()).toContain("27,500円");
  });
  it("keeps a natural, matched eye opening while crow's feet change", () => {
    choose("eyes");
    const before = container.querySelector<SVGSVGElement>('[data-face="before"]')!;
    for (const mode of ["期待できる変化", "変化が少ない例"]) {
      click(mode);
      for (const side of ["left-eye", "right-eye"]) {
        const selector = `[data-feature="${side}"] [data-eye-opening]`;
        const path = before.querySelector(selector)!.getAttribute("d")!;
        expect(afterFace().querySelector(selector)!.getAttribute("d")).toBe(path);
        const coords = path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        expect(coords).toHaveLength(10);
        const opening = (coords[7]! - coords[3]!) / 2;
        const width = coords[4]! - coords[0]!;
        expect(opening / width).toBeGreaterThan(.28);
        expect(opening / width).toBeLessThan(.55);
      }
    }
    const originalOpening = before.querySelector('[data-feature="right-eye"] [data-eye-opening]')!.getAttribute("d");
    click("副作用の例");
    expect(container.querySelector(".patient-comparison-focus")?.textContent).toContain("目を閉じようとしたとき");
    expect(before.querySelector('[data-feature="right-eye"] [data-eye-opening]')!.getAttribute("d")).toBe(originalOpening);
    expect(afterFace().getAttribute("viewBox")).toBe(before.getAttribute("viewBox"));
    expect(afterFace().getAttribute("viewBox")).toBe("123 136 154 58");
    click("期待できる変化");
    expect(afterFace().querySelector('[data-feature="right-eye"] [data-eye-opening]')!.getAttribute("d")).toBe(originalOpening);
  });
  it("matches close-ups and removes the treatment tint from the default comparison", () => {
    for (const concern of PATIENT_CONCERNS) {
      choose(concern.id);
      const before = container.querySelector<SVGSVGElement>('[data-face="before"]')!;
      expect(afterFace().getAttribute("viewBox")).toBe(before.getAttribute("viewBox"));
      expect(container.querySelector(".patient-comparison-focus")?.textContent).toContain(concern.comparisonFocus);
      const overlays = container.querySelectorAll('[data-treatment-area]');
      expect(overlays).toHaveLength(2);
      for (const overlay of overlays) expect(overlay.getAttribute("opacity")).toBe("0");
    }
    click("打つ範囲を重ねる");
    for (const overlay of container.querySelectorAll('[data-treatment-area]')) expect(overlay.getAttribute("opacity")).toBe("1");
    choose("eyes");
    for (const overlay of container.querySelectorAll('[data-treatment-area]')) expect(overlay.getAttribute("opacity")).toBe("0");
  });
  it("makes active creases distinct without changing unrelated wrinkles", () => {
    for (const id of ["glabella", "forehead", "eyes", "bunny", "lips", "chin", "neck"]) {
      choose(id);
      const before = container.querySelector<SVGSVGElement>('[data-face="before"]')!;
      const selector = `[data-wrinkle-region="${id}"]`;
      const beforeOpacity = Number(before.querySelector(selector)!.getAttribute("opacity"));
      const afterOpacity = Number(afterFace().querySelector(selector)!.getAttribute("opacity"));
      expect(beforeOpacity).toBeGreaterThan(.7);
      expect(afterOpacity).toBeGreaterThan(0);
      expect(afterOpacity).toBeLessThan(beforeOpacity / 2);
      for (const region of before.querySelectorAll('[data-wrinkle-region]')) {
        if (region.getAttribute("data-wrinkle-region") === id) continue;
        const other = afterFace().querySelector(`[data-wrinkle-region="${region.getAttribute("data-wrinkle-region")}"]`)!;
        expect(other.outerHTML).toBe(region.outerHTML);
      }
      click("変化が少ない例");
      expect(Number(afterFace().querySelector(selector)!.getAttribute("opacity"))).toBeGreaterThan(afterOpacity);
    }
  });
  it("switches the same-position comparison without changing its price or outcome", () => {
    choose("eyes");
    const fee = price();
    const outcome = afterFace().innerHTML;
    click("同じ位置で切り替え");
    const before = container.querySelector<HTMLElement>('#patient-before-figure')!;
    const after = container.querySelector<HTMLElement>('#patient-after-figure')!;
    expect(before.hidden).toBe(true);
    expect(after.hidden).toBe(false);
    click("施術前");
    expect(before.hidden).toBe(false);
    expect(after.hidden).toBe(true);
    click("施術後の例");
    expect(afterFace().innerHTML).toBe(outcome);
    expect(price()).toBe(fee);
    click("施術前");
    click("変化が少ない例");
    expect(after.hidden).toBe(false);
    click("並べて比較");
    expect(before.hidden).toBe(false);
    expect(after.hidden).toBe(false);
  });
  it("shows less upper-lip lift without erasing the effort to smile", () => {
    choose("gummy");
    const before = container.querySelector<SVGGElement>('[data-face="before"] [data-feature="mouth"]')!;
    const after = afterFace().querySelector<SVGGElement>('[data-feature="mouth"]')!;
    expect(after.dataset.corner).toBe(before.dataset.corner);
    expect(after.dataset.gap).toBe(before.dataset.gap);
    expect(Number(after.dataset.upperLipLift)).toBeLessThan(Number(before.dataset.upperLipLift));
  });

});
