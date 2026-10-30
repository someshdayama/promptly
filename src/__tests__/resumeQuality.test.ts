import { analyzeBullet, analyzeResume, findBuzzwords } from "@/utils/resumeQuality";
import { SOMESH_PROFILE } from "@/data/someshProfile";
import { ResumeData } from "@/types/resume";

const codes = (text: string) => analyzeBullet(text).map((i) => i.code);

describe("resume quality checks", () => {
  it("flags buzzwords with a plainer alternative", () => {
    const issues = analyzeBullet("Architected and maintained robust GitHub Actions workflows for 12 services.");
    expect(issues[0].code).toBe("buzzword");
    expect(issues[0].message).toContain('"architected"');
    expect(issues[0].message).toContain('"robust"');
  });

  it("does not flag words that merely contain a buzzword", () => {
    expect(findBuzzwords("Built a complexity report for 3 teams")).toEqual([]);
    expect(findBuzzwords("Spearheaded the migration")).toEqual(["spearheaded"]);
  });

  it("flags bullets without concrete scope", () => {
    expect(codes("Built AI agents that automate Jira workflows.")).toContain("no-scope");
    expect(codes("Cut infrastructure costs by 34.56% on GCP.")).not.toContain("no-scope");
    expect(codes("Ran release planning across five teams.")).not.toContain("no-scope");
  });

  it("flags passive openings, label prefixes and overlong bullets", () => {
    expect(codes("Responsible for 3 pipelines")).toContain("weak-opening");
    expect(codes("Cloud Optimization: Cut costs by 20%")).toContain("filler-label");
    expect(codes(`Built ${"very ".repeat(60)}long thing for 2 teams`)).toContain("too-long");
  });

  it("returns no issues for a plain bullet with scope", () => {
    expect(analyzeBullet("Release Train Engineer for the product, running delivery across 5 teams (21 members).")).toEqual([]);
  });

  it("reports flagged bullets with their position and buzzwords in the summary", () => {
    const data: ResumeData = {
      personalInfo: { fullName: "A", email: "a@b.c", phone: "", location: "" },
      summary: "Results-driven engineer with a proven track record.",
      experience: [
        { company: "X", position: "Engineer", startDate: "2020", endDate: "Present", description: ["Cut build time by 40%.", "Spearheaded robust platforms."] },
      ],
      education: [],
      skills: [],
    };
    const report = analyzeResume(data);
    expect(report.bulletCount).toBe(2);
    expect(report.flaggedCount).toBe(1);
    expect(report.bullets[0]).toMatchObject({ jobIndex: 0, bulletIndex: 1 });
    expect(report.summaryIssues[0].message).toMatch(/results-driven/);
  });

  it("finds no buzzwords in the default example resume", () => {
    const report = analyzeResume(SOMESH_PROFILE);
    expect(report.summaryIssues).toEqual([]);
    expect(report.bullets.flatMap((b) => b.issues).filter((i) => i.code === "buzzword")).toEqual([]);
  });

  it("suggests grouping a long flat skills list that cannot be auto-grouped", () => {
    const skills = ["Negotiation", "Sales", "CRM", "Excel", "Forecasting", "Coaching", "Hiring", "Budgeting", "Pricing", "Retail", "Ops", "Training", "Payroll"];
    const data = { ...SOMESH_PROFILE, skillGroups: undefined, skills };
    expect(analyzeResume(data).tips.join(" ")).toMatch(/Grouping them by category/);
    expect(analyzeResume({ ...SOMESH_PROFILE, skillGroups: undefined }).tips.join(" ")).not.toMatch(/Grouping them/);
  });
});
