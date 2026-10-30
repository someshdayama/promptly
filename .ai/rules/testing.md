# Testing Conventions

## General
- Tests use Jest + React Testing Library (`npm test`)
- Test files live in `src/__tests__/` with a `.test.ts` / `.test.tsx` suffix

## Guidelines
- Test component rendering, form interactions, and template selection
- Mock the Gemini AI API calls — never make real API requests in tests
- Test error states (invalid API key, network failures)
- Test TypeScript types are correctly applied
- Use `screen.getByRole()` and accessible queries
