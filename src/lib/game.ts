/**
 * The game's rules as the wiki reads them: src/data/game.json, dumped from
 * the game's own horizon_core package (exported by a private script in Nirah Digital's game repo).
 * Nothing here is hand-copied from the game, so the wiki can't drift.
 */
import raw from '../data/game.json'
import looksRaw from '../data/looks.json'

export const game = raw

export type Building = (typeof raw.buildings)[number]
export type BuildingLevel = Building['levels'][number]
export type Troop = (typeof raw.troops)[number]
export type Stronghold = (typeof raw.campaign.strongholds)[number]
export type CostMap = Partial<Record<Res, number>>

export const RES = ['food', 'wood', 'stone', 'iron', 'gold', 'gems'] as const
export type Res = (typeof RES)[number]
export const RES_LABEL: Record<Res, string> = { food: 'Food', wood: 'Wood', stone: 'Stone', iron: 'Iron', gold: 'Gold', gems: 'Gems' }

export const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
export const url = (path = '') => base + path.replace(/^\//, '')
export const art = (path: string) => url(`art/${path}`)

/** nirah.co's smart link: phones go to their own store, computers get a chooser. */
export const STORE_LINK = 'https://nirah.co/apps/horizon'

export const STORE = {
  ios: 'https://apps.apple.com/app/id6817408049',
  android: 'https://play.google.com/store/apps/details?id=co.nirah.horizon',
}

// ── Formatting ──────────────────────────────────────────────────────────

export const num = (n: number | null | undefined, digits = 0) =>
  n == null ? '—' : Number(n).toLocaleString('en', { maximumFractionDigits: digits })

/** The game's own countdown style: "1d 4h", "3h 12m", "4m 05s", "12s". */
export function duration(seconds: number): string {
  if (!seconds || seconds <= 0) return 'instant'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  if (m > 0) return s > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${m}m`
  return `${s}s`
}

export function costEntries(c: Partial<Record<string, number>> | undefined): [Res, number][] {
  return RES.filter((r) => (c?.[r] ?? 0) > 0).map((r) => [r, c![r] as number])
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// ── The Keep ───────────────────────────────────────────────────────────

export const keepLevels = Array.from({ length: game.maxKeep }, (_, i) => i + 1)

// ── Buildings ───────────────────────────────────────────────────────────

export const CATEGORY: Record<string, { name: string; blurb: string; order: number }> = {
  core: { name: 'The Keep', blurb: 'The heart of the kingdom.', order: 0 },
  builder: { name: 'Houses', blurb: 'Every villager builds one thing at a time.', order: 1 },
  resource: { name: 'Resources', blurb: 'Farms, sawmills, quarries, mines and the stores that keep their goods.', order: 2 },
  trade: { name: 'Trade', blurb: 'Buy and sell goods for gold at the world price.', order: 3 },
  army: { name: 'Army', blurb: 'Train, house and improve your troops.', order: 4 },
  defense: { name: 'Defences', blurb: 'What raiders have to get past.', order: 5 },
  wall: { name: 'Walls', blurb: 'Make raiders break through or walk around.', order: 6 },
  trap: { name: 'Traps', blurb: 'Hidden surprises.', order: 7 },
}

export const buildings = [...game.buildings].sort((a, b) => CATEGORY[a.category].order - CATEGORY[b.category].order)
export const buildingSlug = (b: Pick<Building, 'name'>) => slug(b.name)
export const buildingById = (id: string) => game.buildings.find((b) => b.id === id)
export const buildingName = (id: string) => buildingById(id)?.name ?? id

// ── Pictures, one per level (src/data/looks.json, made by `npm run sync`) ──

interface BuildingLook {
  level: number
  w: number
  h: number
  gy: number
}
interface TroopLooks {
  levels: number[]
  w: number
  h: number
  gx: number
  gy: number
}
export const looks = looksRaw as unknown as {
  buildings: Record<string, BuildingLook[]>
  troops: Record<string, TroopLooks>
  missing: string[]
}

/** One level's picture for a "How it looks" gallery: where the ground is, as shares of the picture. */
export interface Look {
  src: string
  alt: string
  caption: string
  w: number
  h: number
  gx: number
  gy: number
}

/** Every level of [b] that has a picture. */
export const buildingLooks = (b: Pick<Building, 'key' | 'name'>): Look[] =>
  (looks.buildings[b.key] ?? []).map((l) => ({
    src: `levels/buildings/${b.key}_${l.level}.webp`,
    alt: `${b.name}, level ${l.level}`,
    caption: `Level ${l.level}`,
    w: l.w,
    h: l.h,
    gx: 0.5,
    gy: l.gy,
  }))

/** Every level of troop or hero [t] that has a picture, all the same size with the feet on the same spot. */
export function troopLooks(t: { key: string; name: string }, name = t.name): Look[] {
  const x = looks.troops[t.key]
  if (!x) return []
  return x.levels.map((level) => ({
    src: `levels/troops/${t.key}_${level}.webp`,
    alt: `${name}, level ${level}`,
    caption: `Level ${level}`,
    w: x.w,
    h: x.h,
    gx: x.gx,
    gy: x.gy,
  }))
}

/** The picture for a building at a level (the nearest level below with one, if that level has none). */
export function buildingArt(b: Building, level = b.levels.length): string {
  const have = looks.buildings[b.key] ?? []
  const pick = [...have].reverse().find((l) => l.level <= level) ?? have[0]
  return art(`levels/buildings/${b.key}_${pick?.level ?? 1}.webp`)
}

/** The highest level of [b] a Keep at [keep] allows (0 = not yet). */
export const maxLevelAtKeep = (b: Building, keep: number) => b.levels.filter((l) => l.keep <= keep).reduce((m, l) => Math.max(m, l.level), 0)

export const totalCost = (levels: BuildingLevel[]) => {
  const t: Record<string, number> = {}
  for (const l of levels) for (const [r, n] of Object.entries(l.cost)) t[r] = (t[r] ?? 0) + (n as number)
  return t
}

export const SHOT: Record<string, string> = { cannonball: 'cannonballs', arrow: 'arrows', shell: 'exploding shells', bolt: 'piercing bolts' }

// ── Troops ──────────────────────────────────────────────────────────────

export const troops = game.troops
export const lord = game.lord
export const lady = game.lady
export const troopSlug = (t: Pick<Troop, 'name'>) => slug(t.name)
export const troopByKey = (k: string) =>
  [...game.troops, game.lord, ...((game as any).lady ? [(game as any).lady] : [])].find((t) => t.id === k || t.key === k)

export const PREF: Record<string, string> = {
  any: 'Whatever is closest',
  resources: 'Storages and producers first',
  defenses: 'Defences first',
  walls: 'Walls first',
}

export function troopTraits(t: Troop | typeof game.lord): string[] {
  const out: string[] = []
  if (t.hero) out.push('Hero')
  if (t.mounted) out.push('Mounted')
  if (t.ranged) out.push('Ranged')
  if (t.healer) out.push('Healer')
  if (t.suicide) out.push('Explodes')
  if (t.splash > 0 && !t.healer) out.push('Splash damage')
  if (t.arrowTaken < 1) out.push(`Takes ${Math.round(t.arrowTaken * 100)}% from arrows`)
  if (t.prefMultiplier > 1) out.push(`×${t.prefMultiplier} against its targets`)
  return out
}

// ── Strongholds ─────────────────────────────────────────────────────────

export const chapters = game.campaign.chapters
export const strongholds = game.campaign.strongholds
export const strongholdSlug = (s: Pick<Stronghold, 'name'>) => slug(s.name)
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

// ── Leagues and emblems (from the game's lib/, not horizon_core) ────────

// The trophy ladder (horizon_core progress/leagues.dart): tier floors
// III · II · I, and the league bonus a 3-star raid pays at tier III (II
// pays ×1.1, I ×1.2; stars/3 of it for fewer stars).
export const LEAGUES = [
  { id: 'unranked', name: 'Unranked', from: 0, tiers: [] as number[], gold: 120, goods: 400 },
  { id: 'copper', name: 'Copper League', from: 200, tiers: [200, 300, 400], gold: 300, goods: 1200 },
  { id: 'bronze', name: 'Bronze League', from: 500, tiers: [500, 635, 765], gold: 750, goods: 3000 },
  { id: 'silver', name: 'Silver League', from: 900, tiers: [900, 1065, 1235], gold: 1500, goods: 6500 },
  { id: 'gold', name: 'Gold League', from: 1400, tiers: [1400, 1600, 1800], gold: 2700, goods: 12000 },
  { id: 'royal', name: 'Royal League', from: 2000, tiers: [2000, 2265, 2535], gold: 4500, goods: 20000 },
  { id: 'legend', name: 'Legend League', from: 2800, tiers: [] as number[], gold: 7500, goods: 30000 },
]

export const EMBLEMS = [
  { id: 'trophy_1', name: 'Champion of the Realm', how: 'First place on the trophy board' },
  { id: 'trophy_3', name: 'Top 3 Lord', how: 'Top 3 on the trophy board' },
  { id: 'trophy_10', name: 'Top 10 Lord', how: 'Top 10 on the trophy board' },
  { id: 'raider_1', name: 'Warlord', how: 'First place by raids won' },
  { id: 'raider_3', name: 'Top 3 Raider', how: 'Top 3 by raids won' },
  { id: 'raider_10', name: 'Top 10 Raider', how: 'Top 10 by raids won' },
  { id: 'defender_1', name: 'Iron Wall', how: 'First place by raids fended off' },
  { id: 'defender_3', name: 'Top 3 Defender', how: 'Top 3 by raids fended off' },
  { id: 'defender_10', name: 'Top 10 Defender', how: 'Top 10 by raids fended off' },
  { id: 'founder', name: 'Founder', how: 'Joined the realm in its first season and reached level 3' },
  { id: 'campaign', name: 'Master Strategist', how: 'All 150 stars in the Raider Strongholds' },
  { id: 'imperial', name: 'Lord of the High Keep', how: 'Raised the Keep to the highest level there is' },
  { id: 'benefactor', name: 'Benefactor', how: 'Sent a gift pack to another lord' },
  { id: 'recruiter', name: 'Recruiter', how: 'Three invited friends earned their rewards' },
]

export const GEM_PACKS = [
  { name: 'Pouch of Gems', gems: 80 },
  { name: 'Bag of Gems', gems: 500 },
  { name: 'Sack of Gems', gems: 1200 },
  { name: 'Chest of Gems', gems: 2600 },
  { name: 'Vault of Gems', gems: 7000 },
  { name: 'Royal Treasury', gems: 15000 },
]
export const STARTER_PACK = { name: 'Starter Pack', gems: 250, goods: { gold: 5000, food: 2000, wood: 2000, stone: 2000, iron: 1000 } }
export const INVITES = { welcomeGems: 100, milestones: [{ keep: 3, gems: 250 }, { keep: 5, gems: 500 }], maxFriends: 20, days: 7 }
