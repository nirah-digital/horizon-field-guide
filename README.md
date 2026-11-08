# Horizon Field Guide

The public field guide to **Horizon: Tides of War**, the coastal-kingdom strategy game by
[Nirah Digital](https://nirah.co/): every building, troop, the Lord, the 24 Raider Strongholds,
the Keep, leagues and emblems, the live world market and gems.

Live at **https://nirah.co/horizon/**.

Built with [Astro](https://astro.build/), static output, [Pagefind](https://pagefind.app/) search and Vitest.

```bash
npm ci
npm run dev     # local dev server
npm test        # formulas and art-completeness checks
npm run build   # astro check + build + search index
```

## What's here

- `src/pages`, `src/components`, `src/layouts`, `src/lib` — the site (code).
- `src/data/*.json` — the game's numbers, exported from the game's rules package. In Nirah Digital's own
  repo this is regenerated after every game release by a private script; here it is a snapshot.
- `public/art` — pictures from the game.

## Licence

The **code** is MIT licensed (see [LICENSE](LICENSE)).
The **game data, text and art** (`src/data`, `public/art`, and the guide's written content) are
© 2026 Nirah Digital, all rights reserved, and are published here so the site can be built, not for reuse.
