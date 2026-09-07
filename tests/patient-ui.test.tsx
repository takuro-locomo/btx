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
    expect(container.querySelectorAll(".concern-button")).toHaveLength(10);
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
    expect(container.querySelector(".patient-discount")?.textContent).toContain(
      "11,000円",
    );
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
  it("clears adverse mode and enlargement when choosing a different concern", () => {
    click("部位を拡大 ↗");
    click("副作用の例");
    choose("forehead");
    expect(afterFace().getAttribute("viewBox")).toBe("120 58 164 224");
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
});
