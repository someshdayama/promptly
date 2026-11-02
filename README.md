# Promptly — make your resume

Paste your old resume, your LinkedIn profile (or upload its "Save to PDF" file), or plain notes. Optionally add the job post. Promptly turns it into a clean one-page resume you can edit line by line and download as a PDF. Live at https://resumebuilder-promptly.vercel.app.

## How it works

1. **Paste or upload.** The notes box takes any text. "Upload PDF" reads the text out of a PDF in your browser (pdf.js, loaded only when used; 5 MB cap; scanned image-only PDFs are rejected with a plain message).
2. **Make.** `POST /api/generate` sends the notes (and the job post, once) to Google Gemini (`gemini-2.5-flash`) with a JSON schema. Only fields that are always knowable are required, so the model never has to invent dates, emails or degrees. The server caps input size, rate-limits per instance, and cleans the output (e.g. nothing listed in both Skills and Certifications).
3. **Fix and download.** Click any line in the preview to edit it. Pick a layout (ATS, Minimalist, Modern), A4 or Letter, and spacing. The preview measures itself and picks the roomiest spacing that fits one page, and warns in amber when it runs over. "Download PDF" builds a real, text-based PDF with `@react-pdf/renderer` (Inter embedded) that matches the chosen layout, tightening spacing until it fits one page.

Nothing is stored on a server. Notes, job post and the edited resume are kept in `localStorage` under separate keys (`promptly.*.v2`); "Clear" removes them.

## Resume check

A local (no AI) check flags buzzwords with plainer alternatives, bullets with no concrete scope, passive openings, "Label: …" prefixes, overlong bullets and a buzzword-heavy summary. It shows as one line that opens for details.

## Development

```bash
npm install
npm run dev       # copies the pdf.js worker into public/, then starts Next.js
npm test          # Jest + React Testing Library
npx tsc --noEmit  # type check
npm run lint
npm run build
```

Set `GEMINI_API_KEY` in `.env.local` (and in Vercel → Environment Variables). Never commit keys.

"Try an example" loads a made-up person (`src/data/exampleProfile.ts`).

## Deploy

Vercel deploys `main` automatically through its GitHub integration.
