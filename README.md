# CT Explorer — Trial Intelligence

## Deploy with GitHub Pages (no Vercel needed)

1. Upload all files to GitHub repo
2. Add Secret: Settings → Secrets → Actions → New secret
   - Name: `VITE_ANTHROPIC_API_KEY`
   - Value: your API key
3. Settings → Pages → Source: **GitHub Actions**
4. Push any change → auto deploys to `https://username.github.io/ct-explorer/`
