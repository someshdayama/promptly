import { LIMITS, validateGenerateBody } from "@/utils/generateRequest";
import { cleanResume } from "@/utils/cleanResume";
import { looksGenerated } from "@/utils/storage";
import { resumeFileName } from "@/utils/fileName";
import { buildUserPrompt, resumeSchema } from "@/app/api/generate/prompt";

describe("validateGenerateBody", () => {
  it("rejects empty notes, even with a job post", () => {
    expect(validateGenerateBody({ notes: "  ", jobPost: "Nurse" })).toMatchObject({ ok: false, status: 400 });
    expect(validateGenerateBody({ jobPost: "Nurse" })).toMatchObject({ ok: false, status: 400 });
  });
  it("rejects non-text and oversize input", () => {
    expect(validateGenerateBody({ notes: { a: 1 } })).toMatchObject({ ok: false, status: 400 });
    expect(validateGenerateBody({ notes: "x".repeat(LIMITS.notes + 1) })).toMatchObject({ ok: false, status: 413 });
    expect(validateGenerateBody({ notes: "ok", jobPost: "x".repeat(LIMITS.jobPost + 1) })).toMatchObject({ ok: false, status: 413 });
    expect(validateGenerateBody(null)).toMatchObject({ ok: false });
  });
  it("trims and accepts valid input", () => {
    expect(validateGenerateBody({ notes: " Nurse since 2021 ", jobPost: "" })).toEqual({
      ok: true,
      input: { notes: "Nurse since 2021", jobPost: "", jobTitle: "", company: "" },
    });
  });
});

describe("buildUserPrompt", () => {
  it("includes the job post exactly once", () => {
    const text = buildUserPrompt({ notes: "My notes", jobPost: "UNIQUE-JOB-POST", jobTitle: "", company: "" });
    expect(text.split("UNIQUE-JOB-POST")).toHaveLength(2);
  });
  it("leaves out the job section when there is no job post", () => {
    expect(buildUserPrompt({ notes: "My notes", jobPost: "", jobTitle: "", company: "" })).not.toMatch(/JOB POST/);
  });
});

describe("resume schema", () => {
  it("does not force dates or contact details the person may not have given", () => {
    const s = resumeSchema as unknown as { properties: Record<string, { required?: string[]; items?: { required?: string[] } }> };
    expect(s.properties.personalInfo.required).toEqual(["fullName"]);
    expect(s.properties.education.items?.required).toEqual(["institution", "degree"]);
    expect(s.properties.experience.items?.required).not.toContain("startDate");
  });
});

describe("cleanResume", () => {
  it("drops skills that are also certifications and fills missing fields with empty strings", () => {
    const out = cleanResume({
      personalInfo: { fullName: " Priya " },
      summary: "Nurse.",
      experience: [{ company: "Ruby Hall", position: "Nurse", description: ["Ran an ICU of 20 beds."] }],
      education: [{ institution: "BV", degree: "B.Sc Nursing", endDate: "2018" }],
      skills: ["IV therapy", "BLS"],
      skillGroups: [{ category: "Clinical", items: ["IV therapy", "bls"] }],
      certifications: ["BLS"],
    });
    expect(out.personalInfo).toEqual({ fullName: "Priya", email: "", phone: "", location: "", linkedinUrl: "", portfolioUrl: "" });
    expect(out.skills).toEqual(["IV therapy"]);
    expect(out.skillGroups).toEqual([{ category: "Clinical", items: ["IV therapy"] }]);
    expect(out.education[0].startDate).toBe("");
    expect(out.experience[0].startDate).toBe("");
  });
  it("survives junk", () => {
    expect(cleanResume("nope").experience).toEqual([]);
  });
});

describe("storage and file name helpers", () => {
  it("spots old auto-written notes", () => {
    expect(looksGenerated("My name is A B. I am based in Pune. Phone: 1.")).toBe(true);
    expect(looksGenerated("Nurse at Ruby Hall since 2021")).toBe(false);
  });
  it("makes a clean PDF file name", () => {
    expect(resumeFileName("Maya Fernandes")).toBe("Maya_Fernandes_Resume.pdf");
    expect(resumeFileName("  ")).toBe("My_Resume.pdf");
    expect(resumeFileName("José O'Neil")).toBe("José_O_Neil_Resume.pdf");
  });
});
