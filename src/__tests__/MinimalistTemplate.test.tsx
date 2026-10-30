import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MinimalistTemplate from "@/components/resume/MinimalistTemplate";
import { ResumeData } from "@/types/resume";

const mockResumeData: ResumeData = {
  personalInfo: {
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    location: "San Francisco, CA",
    linkedinUrl: "https://linkedin.com/in/johndoe",
  },
  summary: "A brief summary of experience.",
  experience: [
    {
      company: "Acme Corp",
      position: "Senior Engineer",
      startDate: "Jan 2020",
      endDate: "Present",
      description: ["Designed scalable architectures.", "Optimized systems by 30%."],
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. Computer Science",
      startDate: "2015",
      endDate: "2019",
    },
  ],
  skills: ["React", "Node.js", "Docker"],
};

describe("MinimalistTemplate Component", () => {
  it("renders personal info correctly", () => {
    render(<MinimalistTemplate data={mockResumeData} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890")).toBeInTheDocument();
    expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
    const linkedinLink = screen.getByRole("link", { name: /linkedin/i });
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute("href", "https://linkedin.com/in/johndoe");
  });

  it("renders summary section when present", () => {
    render(<MinimalistTemplate data={mockResumeData} />);
    expect(screen.getByText("A brief summary of experience.")).toBeInTheDocument();
  });

  it("renders experience section accurately", () => {
    render(<MinimalistTemplate data={mockResumeData} />);
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Designed scalable architectures.")).toBeInTheDocument();
    expect(screen.getByText("Optimized systems by 30%.")).toBeInTheDocument();
  });

  it("renders education section accurately", () => {
    render(<MinimalistTemplate data={mockResumeData} />);
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("B.S. Computer Science")).toBeInTheDocument();
    expect(screen.getByText("State University")).toBeInTheDocument();
  });

  it("renders skill tags", () => {
    render(<MinimalistTemplate data={mockResumeData} />);
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("React, Node.js, Docker")).toBeInTheDocument();
  });
});
