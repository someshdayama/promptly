Review the current codebase for:

1. **Code Quality**: Check for unused imports, dead code, TypeScript errors, and inconsistencies
2. **Type Safety**: Verify all types are properly defined and used, no `any` escape hatches
3. **Performance**: Check for unnecessary re-renders, missing memoization, Server vs Client component splits
4. **API Security**: Ensure Gemini API key is never exposed to the client, all AI calls go through API routes
5. **Accessibility**: Verify ARIA labels, keyboard navigation, and semantic HTML
6. **Responsive Design**: Ensure forms and resume preview work across screen sizes

Provide a summary with actionable suggestions grouped by severity (critical, moderate, minor).
