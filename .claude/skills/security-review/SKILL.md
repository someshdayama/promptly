---
name: security-review
description: Perform a security review of the project with API key focus
---

# Security Review

Perform a comprehensive security audit with special focus on API key management:

## Steps

1. **API Key Audit**: 
   - Verify `GEMINI_API_KEY` is NEVER in client-side code
   - Check that `.env*` files are gitignored
   - Ensure API key is not logged in error messages or console output
2. **Dependency Audit**: Run `npm audit` and report any vulnerabilities
3. **Server/Client Boundary**: Verify `'use client'` components don't import server-only modules
4. **Input Validation**: Check for unvalidated user inputs in forms and API routes
5. **XSS Prevention**: Ensure AI-generated content is properly sanitized before rendering
6. **Dependencies**: Flag any outdated dependencies with known CVEs

## Output

Provide a report with:
- **Critical**: Must fix immediately (especially API key exposure)
- **Warning**: Should fix soon
- **Info**: Best practice recommendations
