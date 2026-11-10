/**
 * The one-page search skips builds whose answer is already known. It must pick
 * exactly the scale a plain bisection (building every step) picks.
 */
import { TextDecoder } from "node:util";
import { FIT_RANGE } from "@/utils/pageFit";

Object.assign(globalThis, { TextDecoder });

let threshold = 1; // largest scale that still fits on one page in the fake layout
let builds = 0;

jest.mock("@/components/pdf/pdfStyles", () => ({ spacingFor: (_t: string, scale: number) => ({ scale }) }));
jest.mock("@/components/pdf/ResumePdf", () => ({ __esModule: true, default: () => null }));
jest.mock("@react-pdf/renderer", () => ({
  Font: { register: () => {}, registerHyphenationCallback: () => {} },
  pdf: (el: { props: { spacing: { scale: number } } }) => ({
    toBlob: async () => {
      builds++;
      const pages = el.props.spacing.scale <= threshold ? 1 : 2;
      const bytes = new Uint8Array(Buffer.from(Array(pages).fill("/Type /Page\n").join(""), "latin1"));
      return { arrayBuffer: async () => bytes.buffer };
    },
  }),
}));

import { makeResumePdf } from "@/components/pdf/makePdf";
import type { ResumeData } from "@/types/resume";

/** The search as it was before: build every step. */
function plainBisection(t: number): number {
  const fits = (s: number) => s <= t;
  if (fits(FIT_RANGE.max)) return FIT_RANGE.max;
  if (!fits(FIT_RANGE.min)) return 1;
  let best: number = FIT_RANGE.min;
  let lo: number = FIT_RANGE.min;
  let hi: number = FIT_RANGE.max;
  while (hi - lo > 0.012) {
    const mid = Math.round(((lo + hi) / 2) * 1000) / 1000;
    if (fits(mid)) {
      best = lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

const data = {} as ResumeData;

describe("one-page fit search", () => {
  it("matches a plain bisection for every layout, in any order", async () => {
    const thresholds = [1.3, 1.31, 1.305, 0.79, 1.8, 0.8, 1.75, 1.2, 1.21, 0.95, 1.3, 1.6, 1.0];
    for (const t of thresholds) {
      threshold = t;
      const out = await makeResumePdf({ data, template: "ats", pageSize: "a4", mode: "one" });
      expect(out.scale).toBe(plainBisection(t));
      expect(out.pages).toBe(t >= FIT_RANGE.min ? 1 : 2);
    }
  });

  it("needs only two builds when a small edit keeps the same answer", async () => {
    threshold = 1.42;
    await makeResumePdf({ data, template: "modern", pageSize: "letter", mode: "one" });
    threshold = 1.421;
    builds = 0;
    const out = await makeResumePdf({ data, template: "modern", pageSize: "letter", mode: "one" });
    expect(out.scale).toBe(plainBisection(1.421));
    expect(builds).toBe(2);
  });
});
