# Promptly — AI resume builder

Paste raw notes, an old CV, or a LinkedIn profile, optionally add a job description, and Promptly turns it into a clean, one-page, ATS-friendly resume. Live at https://resumebuilder-promptly.vercel.app.

## Resume quality features

- **Resume check** (left panel): flags buzzwords ("architected", "spearheaded", "robust", "complex"…) with plainer alternatives, bullets with no concrete scope (no number, team size, users or %), passive openings ("Responsible for…"), "Label: …" prefixes, overlong bullets, and a buzzword-heavy summary. Runs locally, no AI call.
- **Grouped skills**: skills render as `Category: items` lines (Cloud, CI/CD, Containers & IaC, …). The AI fills `skillGroups`; long flat lists are auto-grouped when the categories are clear.
- **Roles grouped by company**: consecutive roles at one company show under one company heading with the overall dates, each role's dates, and an optional note such as "promoted to Software Engineer".
- **One-page fit**: the preview measures the printed height for A4 or Letter, auto-picks the roomiest spacing that fits one page, and warns (with a page-break guide) when it still runs over.
- **Profile links**: LinkedIn and portfolio URLs render as clickable links in the header.
- **What you see is what prints**: the preview uses the same page size and margins as the PDF.

## Testing

```bash
npm test         # Jest + React Testing Library
npx tsc --noEmit # type check
npm run lint
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
