import { groupExperienceByCompany, formatDateRange } from "@/utils/experience";
import { autoGroupSkills, getSkillGroups, parseSkillList } from "@/utils/skills";
import { displayUrl, normalizeUrl } from "@/utils/links";
import { FIT_STEPS, SPACING_PRESETS, contentBox, fitLineHeight, pickFit, PAGE_SIZES } from "@/utils/pageFit";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";
import { EXAMPLE_PROFILE } from "@/data/exampleProfile";

describe("groupExperienceByCompany", () => {
  it("groups consecutive roles at the same company and spans their dates", () => {
    const groups = groupExperienceByCompany(EXAMPLE_PROFILE.experience);
    expect(groups).toHaveLength(2);
    expect(groups[0].company).toBe("Kestrel Pay Pvt. Ltd.");
    expect(groups[0].roles.map((r) => r.position)).toEqual(["Senior Backend Engineer", "Backend Engineer"]);
    expect(groups[0].roles.map((r) => r.index)).toEqual([0, 1]);
    expect(formatDateRange(groups[0].startDate, groups[0].endDate)).toBe("Jul 2021 – Present");
  });

  it("ignores punctuation and case differences in company names but not other companies", () => {
    const groups = groupExperienceByCompany([
      { company: "Acme, Inc.", position: "Senior", startDate: "2022", endDate: "Present", description: [] },
      { company: "acme inc", position: "Junior", startDate: "2020", endDate: "2022", description: [] },
      { company: "Other", position: "Intern", startDate: "2019", endDate: "2019", description: [] },
      { company: "Acme Inc", position: "Contractor", startDate: "2018", endDate: "2019", description: [] },
    ]);
    expect(groups.map((g) => g.roles.length)).toEqual([2, 1, 1]);
  });
});

describe("skills grouping", () => {
  it("prefers explicit skill groups", () => {
    expect(getSkillGroups(EXAMPLE_PROFILE)?.map((g) => g.category)).toEqual([
      "Languages", "Cloud", "Containers & IaC", "Data", "Monitoring",
    ]);
  });

  it("auto-groups a long, recognisable flat list", () => {
    const groups = getSkillGroups({ skills: ["AWS", "GCP", "Jenkins", "Docker", "Kubernetes (GKE)", "Terraform", "Python", "Bash", "Prometheus", "JIRA"] });
    expect(groups?.find((g) => g.category === "Cloud")?.items).toEqual(["AWS", "GCP"]);
    expect(groups?.find((g) => g.category === "Containers & IaC")?.items).toEqual(["Docker", "Kubernetes (GKE)", "Terraform"]);
  });

  it("keeps short or unrecognised lists flat", () => {
    expect(getSkillGroups({ skills: ["React", "Docker"] })).toBeNull();
    expect(getSkillGroups({ skills: ["Negotiation", "Sales", "CRM", "Excel", "Forecasting", "Coaching", "Hiring", "AWS"] })).toBeNull();
  });

  it("parses comma or bullet separated text", () => {
    expect(parseSkillList("GCP, Azure • AWS;  ")).toEqual(["GCP", "Azure", "AWS"]);
    expect(autoGroupSkills(["Git"])[0].category).toBe("CI/CD");
  });
});

describe("links", () => {
  it("normalizes and shortens URLs", () => {
    expect(normalizeUrl("linkedin.com/in/x")).toBe("https://linkedin.com/in/x");
    expect(normalizeUrl("javascript:alert(1)")).toBe("");
    expect(displayUrl("https://www.linkedin.com/in/jane-doe/")).toBe("linkedin.com/in/jane-doe");
  });
});

describe("pickFit", () => {
  const limit = contentBox(PAGE_SIZES.a4).heightPx;
  const all = (h: (f: number) => number) => Object.fromEntries(FIT_STEPS.map((f) => [f, h(f)]));

  it("uses the roomiest scale that fits one page", () => {
    // Height grows with scale; only 0.96 and below fit.
    const fit = pickFit(all((f) => (f > 0.96 ? limit + 50 : limit - 20)), limit);
    expect(fit).toEqual({ scale: 0.96, pages: 1, fits: true });
  });
  it("gives a short resume the roomiest step, never more", () => {
    expect(pickFit(all(() => limit * 0.6), limit)?.scale).toBe(FIT_STEPS[0]);
    expect(FIT_STEPS[0]).toBeLessThanOrEqual(1.12);
  });
  it("reports page count when nothing fits", () => {
    expect(pickFit(all((f) => limit * (1 + f)), limit)).toEqual({ scale: 0.84, pages: 1.8, fits: false });
  });
  it("waits for all measurements in auto mode and honours a manual choice", () => {
    expect(pickFit({ 1: 100 }, limit)).toBeNull();
    expect(pickFit({ 0.92: limit * 1.25 }, limit, "compact")).toEqual({ scale: 0.92, pages: 1.3, fits: false });
    expect(pickFit({ 1.08: 500 }, limit, "roomy")).toEqual({ scale: 1.08, pages: 1, fits: true });
  });
  it("every manual preset is one of the measured steps", () => {
    Object.values(SPACING_PRESETS).forEach((f) => expect(FIT_STEPS as readonly number[]).toContain(f));
  });
  it("keeps line height in a tidy band", () => {
    expect(fitLineHeight(1.34, 1.08)).toBeLessThanOrEqual(1.4);
    expect(fitLineHeight(1.32, 0.84)).toBeGreaterThanOrEqual(1.24);
    expect(fitLineHeight(1.34, 1)).toBe(1.34);
  });
  it("letter pages are shorter than A4", () => {
    expect(contentBox(PAGE_SIZES.letter).heightPx).toBeLessThan(limit);
  });
});

describe("serializeProfileToPrompt", () => {
  it("includes links, grouped skills, promotion notes and certifications", () => {
    const text = serializeProfileToPrompt(EXAMPLE_PROFILE);
    expect(text).toContain("LinkedIn: https://www.linkedin.com/in/maya-fernandes-example/");
    expect(text).toContain("Portfolio: https://maya.example.com/");
    expect(text).toContain("- Cloud: AWS, GCP");
    expect(text).toContain("(promoted to Senior Backend Engineer)");
    expect(text).toContain("CERTIFICATIONS:\n- AWS Certified Developer – Associate");
  });
});
