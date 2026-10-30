import { groupExperienceByCompany, formatDateRange } from "@/utils/experience";
import { autoGroupSkills, getSkillGroups, parseSkillList } from "@/utils/skills";
import { displayUrl, normalizeUrl } from "@/utils/links";
import { pickDensity, contentBox, PAGE_SIZES } from "@/utils/pageFit";
import { serializeProfileToPrompt } from "@/utils/promptSerializer";
import { SOMESH_PROFILE } from "@/data/someshProfile";

describe("groupExperienceByCompany", () => {
  it("groups consecutive roles at the same company and spans their dates", () => {
    const groups = groupExperienceByCompany(SOMESH_PROFILE.experience);
    expect(groups).toHaveLength(2);
    expect(groups[1].company).toBe("Monocept Consulting Pvt. Ltd.");
    expect(groups[1].roles.map((r) => r.position)).toEqual(["Software Engineer (SRE / Cloud)", "Trainee Software Engineer"]);
    expect(groups[1].roles.map((r) => r.index)).toEqual([1, 2]);
    expect(formatDateRange(groups[1].startDate, groups[1].endDate)).toBe("Jan 2023 – Feb 2025");
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
    expect(getSkillGroups(SOMESH_PROFILE)?.map((g) => g.category)).toEqual([
      "Cloud", "CI/CD", "Containers & IaC", "Monitoring", "Languages", "Delivery & AI",
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
    expect(displayUrl("https://www.linkedin.com/in/somesh-dayama/")).toBe("linkedin.com/in/somesh-dayama");
  });
});

describe("pickDensity", () => {
  const limit = contentBox(PAGE_SIZES.a4).heightPx;
  it("picks the roomiest spacing that fits one page", () => {
    const fit = pickDensity({ "sp-comfortable": limit + 100, "sp-regular": limit - 10, "sp-compact": 900, "sp-dense": 800 }, limit);
    expect(fit).toEqual({ density: "sp-regular", pages: 1, fits: true });
  });
  it("reports page count when nothing fits", () => {
    const fit = pickDensity({ "sp-comfortable": limit * 2, "sp-regular": limit * 1.8, "sp-compact": limit * 1.6, "sp-dense": limit * 1.4 }, limit);
    expect(fit).toEqual({ density: "sp-dense", pages: 1.4, fits: false });
  });
  it("waits for all measurements in auto mode and honours a manual choice", () => {
    expect(pickDensity({ "sp-comfortable": 100 }, limit)).toBeNull();
    expect(pickDensity({ "sp-compact": limit * 1.25 }, limit, "sp-compact")).toEqual({ density: "sp-compact", pages: 1.3, fits: false });
  });
  it("letter pages are shorter than A4", () => {
    expect(contentBox(PAGE_SIZES.letter).heightPx).toBeLessThan(limit);
  });
});

describe("serializeProfileToPrompt", () => {
  it("includes links, grouped skills, promotion notes and certifications", () => {
    const text = serializeProfileToPrompt(SOMESH_PROFILE);
    expect(text).toContain("LinkedIn: https://www.linkedin.com/in/somesh-dayama/");
    expect(text).toContain("Portfolio: https://portfolio-someshdayama.netlify.app/");
    expect(text).toContain("- Cloud: GCP, Azure, AWS");
    expect(text).toContain("(promoted to Software Engineer)");
    expect(text).toContain("CERTIFICATIONS:\n- Certified Scrum Master (CSM)");
  });
});
