Deploy the application to Vercel:

1. **Pre-flight**:
   - Ensure all dependencies installed: `npm install`
   - Run lint: `npm run lint`
   - Verify environment variables are set (check `.env.local` for `GEMINI_API_KEY`)

2. **Build**:
   ```bash
   npm run build
   ```

3. **Verify build**:
   - Check for TypeScript errors
   - Check for any build warnings
   - Verify `.next/` directory was created

4. **Deploy**:
   - Push to git (Vercel auto-deploys from the linked branch)
   - Or use `npx vercel --prod` for manual deploy
   - Verify `GEMINI_API_KEY` is set in Vercel Environment Variables
