import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResumeCheck from "@/components/ui/ResumeCheck";
import { ResumeData } from "@/types/resume";

const base: ResumeData = {
  personalInfo: { fullName: "Test", email: "t@example.com", phone: "", location: "" },
  summary: "Backend engineer with 5 years of experience on payments APIs.",
  experience: [
    { company: "Acme", position: "Engineer", startDate: "2020", endDate: "Present", description: ["Cut API latency by 40% for 2M users."] },
  ],
  education: [],
  skills: [],
};

describe("ResumeCheck", () => {
  it("shows all clear for plain bullets with scope", () => {
    render(<ResumeCheck resumeData={base} />);
    expect(screen.getByRole("heading", { name: "Resume check" })).toBeInTheDocument();
    expect(screen.getByText("All clear")).toBeInTheDocument();
  });

  it("lists buzzword bullets with the reason", () => {
    const data = {
      ...base,
      experience: [{ ...base.experience[0], description: ["Spearheaded robust platform work."] }],
    };
    render(<ResumeCheck resumeData={data} />);
    expect(screen.getByText(/1 to fix/)).toBeInTheDocument();
    expect(screen.getByText("Spearheaded robust platform work.")).toBeInTheDocument();
    expect(screen.getByText(/"spearheaded" → led/)).toBeInTheDocument();
    expect(screen.getByText(/No concrete scope/)).toBeInTheDocument();
  });
});
