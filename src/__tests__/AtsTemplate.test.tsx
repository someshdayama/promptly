import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import AtsTemplate from "@/components/resume/AtsTemplate";
import ModernTemplate from "@/components/resume/ModernTemplate";
import { SOMESH_PROFILE } from "@/data/someshProfile";

describe("AtsTemplate", () => {
  it("renders LinkedIn and portfolio as clickable links in the header", () => {
    render(<AtsTemplate data={SOMESH_PROFILE} />);
    const linkedin = screen.getByRole("link", { name: "linkedin.com/in/somesh-dayama" });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/somesh-dayama/");
    expect(linkedin).toHaveAttribute("target", "_blank");
    const portfolio = screen.getByRole("link", { name: "portfolio-someshdayama.netlify.app" });
    expect(portfolio).toHaveAttribute("href", "https://portfolio-someshdayama.netlify.app/");
    expect(screen.getByRole("link", { name: "someshdayama2@gmail.com" })).toHaveAttribute("href", "mailto:someshdayama2@gmail.com");
  });

  it("shows one heading per company with the promotion", () => {
    render(<AtsTemplate data={SOMESH_PROFILE} />);
    expect(screen.getAllByRole("heading", { level: 3, name: "Monocept Consulting Pvt. Ltd." })).toHaveLength(1);
    expect(screen.getByText("Jan 2023 – Feb 2025")).toBeInTheDocument();
    expect(screen.getByText("promoted to Software Engineer")).toBeInTheDocument();
  });

  it("renders skills grouped by category", () => {
    render(<AtsTemplate data={SOMESH_PROFILE} />);
    const skills = screen.getByRole("heading", { name: "Skills" }).parentElement as HTMLElement;
    expect(within(skills).getByText("Containers & IaC:")).toBeInTheDocument();
    expect(within(skills).getByText("Kubernetes, Helm, Docker, Terraform, Ansible")).toBeInTheDocument();
  });

  it("renders certifications and uses section headings for structure", () => {
    render(<AtsTemplate data={SOMESH_PROFILE} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Summary", "Skills", "Experience", "Education", "Certifications",
    ]);
    expect(screen.getByText("Certified Scrum Master (CSM)")).toBeInTheDocument();
  });

  it("is not editable without onChange, and editable with it", () => {
    const { unmount } = render(<AtsTemplate data={SOMESH_PROFILE} />);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    unmount();
    render(<AtsTemplate data={SOMESH_PROFILE} onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute("contenteditable", "true");
  });
});

describe("ModernTemplate", () => {
  it("renders profile links and grouped roles", () => {
    render(<ModernTemplate data={SOMESH_PROFILE} />);
    expect(screen.getByRole("link", { name: "portfolio-someshdayama.netlify.app" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3, name: "Monocept Consulting Pvt. Ltd." })).toHaveLength(1);
  });
});
