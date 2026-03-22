# Testing Conventions

## General
- This project does not currently have a test suite
- When adding tests, use Jest + React Testing Library (Next.js default)
- Place test files alongside source files with `.test.tsx` suffix

## Guidelines
- Test component rendering, form interactions, and template selection
- Mock the Gemini AI API calls — never make real API requests in tests
- Test error states (invalid API key, network failures)
- Test TypeScript types are correctly applied
- Use `screen.getByRole()` and accessible queries
