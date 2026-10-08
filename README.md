# SignConnect

SignConnect is a browser-based sign-gesture communication app built with Next.js.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## GitHub Pages

The GitHub Actions workflow builds and deploys the static site whenever changes
are pushed to `main`. In the repository settings, open **Pages** and set **Build
and deployment** to **GitHub Actions**.

After the deployment workflow succeeds, the site is available at:
https://tanmayjagtap007.github.io/Sign-Connect/

Camera access requires a secure browser context (HTTPS or localhost) and camera
permission. Hand-tracking model files are downloaded from their configured
external CDNs when the feature is used.
