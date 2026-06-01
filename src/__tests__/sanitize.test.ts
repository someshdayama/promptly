import { sanitizeHtml } from "@/utils/sanitize";

describe("sanitizeHtml utility", () => {
  it("should return empty string for null/undefined/empty input", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });

  it("should keep safe typography HTML tags", () => {
    const input = "<b>Bold Text</b> and <i>Italic text</i> with bullet • and em-dash —";
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("should strip malicious script tags and inner contents", () => {
    const input = "Hello <script>alert('XSS')</script>World";
    expect(sanitizeHtml(input)).toBe("Hello World");
  });

  it("should strip inline on* event handlers", () => {
    const input = '<img src="x" onerror="alert(1)" onload="console.log(2)" />';
    expect(sanitizeHtml(input)).toBe('<img src="x" />');
  });

  it("should strip javascript: pseudo-protocols inside attributes", () => {
    const input = '<a href="javascript:alert(1)">Click Me</a>';
    expect(sanitizeHtml(input)).toBe('<a >Click Me</a>');
  });

  it("should strip iframe, object, embed, link, meta tags", () => {
    const input = "<div><iframe src='x'></iframe><meta content='x' />Safe Content</div>";
    expect(sanitizeHtml(input)).toBe("<div>Safe Content</div>");
  });
});
