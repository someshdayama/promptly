# Resume Builder

> An AI-powered resume builder using Google Gemini AI to generate tailored resumes. Deployed on Vercel.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **AI**: Google Gemini AI (`@google/genai`)
- **PDF/Print**: react-to-print
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Styling**: CSS (premium dark UI with glassmorphism, gradient backgrounds, animated borders)

## Project Structure

```
src/
├── app/             # Next.js App Router pages and layouts
├── components/      # UI components (forms, templates, preview)
└── types/           # TypeScript type definitions
```

## Development

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |

- **Local**: Set in `.env.local`
- **Vercel**: Set in Vercel dashboard → Environment Variables
- **NEVER** commit API keys to source code

## Conventions

- App Router conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Server Components by default, `'use client'` only when needed
- API routes in `src/app/api/` for server-side AI calls
- Template registry pattern for resume templates
- TypeScript strict mode — all types in `src/types/`
- Premium UI: dark background, glassmorphism, shimmer loading effects, animated borders
- Custom format options for resume output
