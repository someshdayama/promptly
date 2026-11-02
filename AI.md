# Promptly

> Resume maker: notes / old resume / LinkedIn PDF in, one-page resume and PDF out. Deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **AI**: Google Gemini `gemini-2.5-flash` via `@google/generative-ai` (server only, `src/app/api/generate`)
- **PDF export**: `@react-pdf/renderer`, client-side, Inter TTFs in `public/fonts` (embedded, text-selectable)
- **PDF import**: `pdfjs-dist` (legacy build), client-side, lazy-loaded; worker copied to `public/` by `scripts/copy-pdf-worker.mjs`
- **Icons**: Lucide React
- **Styling**: CSS modules. Black and white UI only; amber only for "runs over one page", red only for errors.
- **Deployment**: Vercel (auto-deploys `main`)

## Project Structure

```
src/
├── app/              # page.tsx (builder + footer), layout.tsx (metadata), api/generate (Gemini)
├── components/       # Builder, SiteFooter, resume/ templates, pdf/ PDF templates, ui/
├── data/             # exampleProfile.ts — a fictional person for "Try an example"
├── utils/            # page fit, resume check, storage, validation, PDF text, etc.
└── types/
```

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |

- **Local**: `.env.local`. **Vercel**: dashboard → Environment Variables.
- **NEVER** commit API keys or real personal data.

## Conventions

- Plain words in the UI. No hype, no claims that are not true.
- Never ship real personal data as defaults or test fixtures; use the fictional example.
- Keep the on-screen templates (`components/resume`) and PDF templates (`components/pdf`) in step.
