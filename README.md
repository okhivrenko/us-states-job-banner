# Interactive US Map Hero Banner

A responsive hero banner for a job board: copy and calls to action on the left, and a clickable map of the US on the right. Each state links straight to a job search for that state.

**Live demo:** https://okhivrenko.github.io/us-states-job-banner/

## Features

- **Clickable states.** Each of the 50 states plus DC is a real `<a>` link, so search engines can crawl it, and middle-click and "open in new tab" work as usual.
- **Highlighted states.** Featured states (for example, compact or licensing states) are set as one array in `config.ts`.
- **Hover/focus tooltip.** Shows the state name and a "View jobs" call to action.
- **Accessible.** Every state can be reached with the keyboard (Tab → Enter), with a visible focus ring and an `aria-label` for each state, and the banner respects `prefers-reduced-motion`.
- **Mobile.** A hamburger menu, a stacked layout, and a "Choose a state" dropdown, because Rhode Island or Delaware are hard to tap on a phone.
- **Lightweight.** No framework at runtime: vanilla TypeScript and inline SVG, about 52 KB gzipped, most of it map geometry.
- **Brand colors** live as CSS variables (`--blue: #1B397E`, `--yellow: #EAB828`).

## Configure

```ts
// config.ts
jobsUrl: (code, name) => `/jobs?place=${encodeURIComponent(name)}`,
highlighted: ['ND', 'NE', 'AZ', 'LA', 'SC'],
openInNewTab: false,
```

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

Pushing to `main` deploys the site to GitHub Pages (Settings → Pages → Source: **GitHub Actions**).

## Embedding in a site builder

For a template-based job board (Jobboardly, Webflow, WordPress), run `npm run build`, then paste the markup from `dist/index.html` into a custom-code block and host the `assets/` files. Alternatively, the map script can be inlined as a single `<script>` tag.

## Data

State shapes come from [us-atlas](https://github.com/topojson/us-atlas) (ISC license, based on US Census Bureau data), pre-projected to Albers USA. `states.ts` is generated automatically before `dev` and `build` (`npm run generate:states`), so it is not committed.
