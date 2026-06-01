import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PromptInput from "@/components/ui/PromptInput";

describe("PromptInput Component", () => {
  const setup = () => {
    const handleDataGenerated = jest.fn();
    const handleLoading = jest.fn();
    render(<PromptInput onDataGenerated={handleDataGenerated} onLoading={handleLoading} />);
    return { handleDataGenerated, handleLoading };
  };

  it("renders elements correctly", () => {
    setup();
    expect(screen.getByText("Paste Your Info")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. My name is John Doe/)).toBeInTheDocument();
    expect(screen.getByText("Generate Resume Now")).toBeInTheDocument();
  });

  it("handles Clear and Example button click events", () => {
    setup();
    const exampleButton = screen.getByText("Example");
    fireEvent.click(exampleButton);

    const textarea = screen.getByPlaceholderText(/e.g. My name is John Doe/) as HTMLTextAreaElement;
    expect(textarea.value).toContain("Somesh Dayama");

    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);
    expect(textarea.value).toBe("");
  });

  it("displays validation message if submission tried with empty input", async () => {
    setup();
    const generateBtn = screen.getByText("Generate Resume Now");
    fireEvent.click(generateBtn);

    expect(await screen.findByText("Please enter your details first.")).toBeInTheDocument();
  });
});
