# API Conventions

## Gemini AI API
- All AI calls MUST go through Next.js API routes (`src/app/api/`)
- NEVER import `@google/genai` in client components
- The `GEMINI_API_KEY` is accessed via `process.env.GEMINI_API_KEY` server-side only
- Handle API errors gracefully with user-friendly messages
- Implement loading states while waiting for AI responses
- Set reasonable timeouts for AI generation requests

## API Route Patterns
```typescript
// src/app/api/generate/route.ts
export async function POST(request: Request) {
  // 1. Validate request body
  // 2. Call Gemini AI
  // 3. Return structured response
  // 4. Handle errors with appropriate status codes
}
```

## Environment Variables
- `GEMINI_API_KEY` — required, set in `.env.local` (local) and Vercel dashboard (production)
- Never log API keys, even in error messages
- Use `.env.vercel` for reference only — actual secrets are in Vercel dashboard
