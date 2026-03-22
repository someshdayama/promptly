---
name: deploy
description: Build and deploy to Vercel
---

# Deploy to Vercel

Build and deploy the Next.js application to Vercel.

## Steps

1. **Pre-flight checks**:
   - Ensure all dependencies installed: `npm install`
   - Run lint: `npm run lint`
   - Verify `GEMINI_API_KEY` is set in `.env.local`

2. **Build**:
   ```bash
   npm run build
   ```

3. **Verify build**:
   - Check for TypeScript errors
   - Check for any build warnings
   - Verify `.next/` directory was created

4. **Deploy to Vercel**:
   - Option A: Push to git (auto-deploy from linked branch)
   - Option B: Manual deploy with `npx vercel --prod`

5. **Post-deploy verification**:
   - Verify the live URL is accessible
   - Test AI resume generation works (requires `GEMINI_API_KEY` in Vercel env vars)
   - Report deployment status
