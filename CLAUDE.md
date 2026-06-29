# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev        # Start dev server (Vite)
bun run build      # Production build
bun run lint       # ESLint
bun run format     # Prettier (writes in-place)
```

No test suite is configured.

## Architecture

This is a **TanStack Start** SSR app (React 19, TypeScript) built on Vite with Bun as the package manager. The entry point is `src/start.ts`; the server wrapper is `src/server.ts` (wraps `@tanstack/react-start/server-entry` and handles h3's swallowed SSR errors).

### Routing

File-based routing via TanStack Router lives in `src/routes/`. **`routeTree.gen.ts` is auto-generated — never edit it by hand.** The only root layout is `src/routes/__root.tsx`. See `src/routes/README.md` for naming conventions (dynamic segments use bare `$`, splat params use `_splat`, not `*`).

The router is instantiated in `src/router.tsx` with a shared `QueryClient` passed as router context, consumed via `Route.useRouteContext()` in `__root.tsx`.

### Current page (index route)

The single page at `src/routes/index.tsx` is a scroll-driven landing page with three scenes:

- **Scene 1** — Dark hero (110vh) cross-fading to a light section (100vh). A sticky 3D coin (`GlassCoin`) and a sticky UI overlay sit above the native-scroll backgrounds. Framer Motion `useTransform` on `scrollYProgress` drives color token flips (text, grid lines, buttons) and per-word blur/fade-in for the light headline.
- **Scene 2 pin** — A sticky mirror of the light background keeps scene 2 visible while scene 3 slides up.
- **Scene 3** — "Our Works" sticky stack slider (700vh). `worksProgress` from `useScroll` drives a `ProjectCard` stack where each card's `y`, `scale`, `rotateX`, and `opacity` are updated imperatively via `useMotionValueEvent` (not declarative springs) to avoid re-renders.

### Key components

- **`GlassCoin`** (`src/components/GlassCoin.tsx`) — Three.js canvas (`@react-three/fiber`) with a glass-transmission heart-shaped coin (`MeshTransmissionMaterial`) and a dual-plane background that cross-fades from the dark hero gradient to the light section gradient on scroll. Scroll is read from the inner `.overflow-y-auto` container, not `window`.
- **`ScrambleText` / `ScrambleWords`** (`src/components/ScrambleText.tsx`) — Character-scramble animation. Renders the real text initially (no flash), then scrambles and decodes left-to-right after a 500 ms mount delay. `ScrambleWords` staggers per-word with individual delays.

### Styling

Tailwind CSS v4 (`@tailwindcss/vite`). Design tokens are defined as CSS custom properties in `src/styles.css` under `@theme inline` and `:root` / `.dark` blocks using **oklch** format. Three custom font utilities are declared there: `font-inter-tight`, `font-instrument`, `font-mono-fragment`. The shadcn/ui config (`components.json`) targets `@/components/ui` with the "new-york" style.

### Config notes

- `vite.config.ts` uses `@lovable.dev/vite-tanstack-config` which already bundles TanStack Start, React, Tailwind, tsconfig paths, Nitro, and the `@` alias — do not add these plugins manually.
- `bunfig.toml` enforces a 24-hour supply-chain guard (`minimumReleaseAge = 86400`). Adding a package exclusion requires user confirmation.
- The `@` alias resolves to `src/`.
