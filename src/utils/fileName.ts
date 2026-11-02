/** "Maya Fernandes" → "Maya_Fernandes_Resume.pdf". */
export function resumeFileName(fullName: string | undefined) {
  const clean = (fullName || "").trim().replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "");
  return `${clean || "My"}_Resume.pdf`;
}
