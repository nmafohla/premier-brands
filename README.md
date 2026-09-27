# Premier Brands Ink & Co — Web Platform

Modern, responsive web platform for Premier Brands Ink & Co (Bulawayo, Zimbabwe), specialized in commercial printing, corporate merchandising, stationery supplies, and bespoke branding solutions.

## Architecture

- **Bundler & Dev Server**: [Vite](https://vitejs.dev/) with customized zero-dependency HTML partial inclusion plugin to preserve modular file limits (< 400 lines per file).
- **Language**: TypeScript with strict typing (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Styling**: Modular CSS architecture (`variables.css`, `layout.css`, `components.css`, `sections.css`, `interactive.css`) with modern typography (Fraunces & Outfit).
- **Unit Testing**: [Vitest](https://vitest.dev/) for pure logic verification (catalog search, WhatsApp URL generation, quotation basket).
- **Code Quality**: ESLint 9 (flat config) and Prettier for automated formatting and lint checks.
- **Deployment**: Vercel Edge Network mapped to `premier.hakili.online`.

## Prerequisites

- [Node.js](https://nodejs.org/) v20.x or v22.x+
- `npm` v10+

## Environment Variables

Copy `.env.example` to `.env.local` for local overrides:

| Variable                         | Description                                     | Default / Example               |
| :------------------------------- | :---------------------------------------------- | :------------------------------ |
| `VITE_WHATSAPP_NUMBER`           | Primary WhatsApp business phone (digits only)   | `263781977976`                  |
| `VITE_WHATSAPP_NUMBER_SECONDARY` | Secondary WhatsApp business phone (digits only) | `263783480821`                  |
| `VITE_SITE_URL`                  | Production website URL                          | `https://premier.hakili.online` |

## Local Setup & Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Quality Assurance & Verification

- **Typecheck**:
  ```bash
  npm run typecheck
  ```
- **Linting**:
  ```bash
  npm run lint
  ```
- **Format Check**:
  ```bash
  npm run format:check
  ```
- **Unit Tests**:
  ```bash
  npm run test
  ```
- **Production Build**:
  ```bash
  npm run build
  ```

## Deployment

### Vercel Deployment
The production site is hosted on Vercel:

- **Production Domain**: `https://premier.hakili.online`
- **Build Output**: `dist/`

To deploy manually via the Vercel CLI:

```bash
npx vercel --prod --yes
```

### cPanel Deployment
This repository is configured with automated GitHub Actions (`.github/workflows/deploy-cpanel.yml`):

1. Every push to `main` automatically runs quality checks, builds the production static assets, and pushes the contents of `dist/` to the `cpanel` branch.
2. In **cPanel -> Git Version Control**:
   - Clone URL: `https://github.com/nmafohla/premier-brands.git`
   - Branch: `cpanel`
   - Repository Directory: `/home/username/public_html` (or your chosen subfolder)
3. Whenever new changes land on `main`, pull the `cpanel` branch in cPanel to update your live site instantly without needing Node.js on the server.

