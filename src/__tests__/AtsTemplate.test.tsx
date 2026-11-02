import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import AtsTemplate from "@/components/resume/AtsTemplate";
import ModernTemplate from "@/components/resume/ModernTemplate";
import { EXAMPLE_PROFILE } from "@/data/exampleProfile";

describe("AtsTemplate", () => {
  it("renders LinkedIn and portfolio as clickable links in the header", () => {
    render(<AtsTemplate data={EXAMPLE_PROFILE} />);
    const linkedin = screen.getByRole("link", { name: "linkedin.com/in/maya-fernandes-example" });
    expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/maya-fernandes-example/");
    expect(linkedin).toHaveAttribute("target", "_blank");
    const portfolio = screen.getByRole("link", { name: "maya.example.com" });
    expect(portfolio).toHaveAttribute("href", "https://maya.example.com/");
    expect(screen.getByRole("link", { name: "maya.fernandes@example.com" })).toHaveAttribute("href", "mailto:maya.fernandes@example.com");
  });

  it("shows one heading per company with the promotion", () => {
    render(<AtsTemplate data={EXAMPLE_PROFILE} />);
    expect(screen.getAllByRole("heading", { level: 3, name: "Kestrel Pay Pvt. Ltd." })).toHaveLength(1);
    expect(screen.getByText("Jul 2021 – Present")).toBeInTheDocument();
    expect(screen.getByText("promoted to Senior Backend Engineer")).toBeInTheDocument();
  });

  it("renders skills grouped by category", () => {
    render(<AtsTemplate data={EXAMPLE_PROFILE} />);
    const skills = screen.getByRole("heading", { name: "Skills" }).parentElement as HTMLElement;
    expect(within(skills).getByText("Containers & IaC:")).toBeInTheDocument();
    expect(within(skills).getByText("Kubernetes, Docker, Terraform")).toBeInTheDocument();
  });

  it("renders certifications and uses section headings for structure", () => {
    render(<AtsTemplate data={EXAMPLE_PROFILE} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Summary", "Skills", "Experience", "Education", "Certifications",
    ]);
    expect(screen.getByText("AWS Certified Developer – Associate")).toBeInTheDocument();
  });

  it("is not editable without onChange, and editable with it", () => {
    const { unmount } = render(<AtsTemplate data={EXAMPLE_PROFILE} />);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    unmount();
    render(<AtsTemplate data={EXAMPLE_PROFILE} onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute("contenteditable", "true");
  });
});

describe("ModernTemplate", () => {
  it("renders profile links and grouped roles", () => {
    render(<ModernTemplate data={EXAMPLE_PROFILE} />);
    expect(screen.getByRole("link", { name: "maya.example.com" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3, name: "Kestrel Pay Pvt. Ltd." })).toHaveLength(1);
  });
});
