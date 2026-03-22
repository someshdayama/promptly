# Code Style Rules

## TypeScript / TSX
- Use functional components with hooks (no class components)
- Use `'use client'` directive only for interactive components
- Prefer Server Components for data fetching and static content
- Destructure props with TypeScript interfaces
- Use `const` by default, `let` only when reassignment is needed
- Prefer `interface` over `type` for object shapes
- No `any` types — use `unknown` and narrow appropriately

## Naming
- **Components**: PascalCase (e.g., `ResumePreview`, `TemplateSelector`)
- **Files**: Match the component name (e.g., `ResumePreview.tsx`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `ResumeData`, `TemplateConfig`)
- **Functions/variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **API routes**: kebab-case directories

## Next.js App Router
- Pages in `src/app/` following `page.tsx` convention
- Layouts in `layout.tsx` for shared UI
- Loading states in `loading.tsx`
- Error boundaries in `error.tsx`
- API routes in `src/app/api/` — always server-side

## CSS
- Premium dark UI aesthetic
- Glassmorphism, gradients, animated borders
- Shimmer loading effects
- Responsive across devices

## Imports
- Group imports: React/Next → third-party → local components → types → styles
