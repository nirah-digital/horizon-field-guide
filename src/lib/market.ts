/**
 * The live market's tide (packages/horizon_core/lib/src/economy/market.dart
 * → anchorPrice, also worldPrice): what prices drift back to between
 * trades. The live prices themselves come from the game's server
 * (market/now) — this is the fallback and the wiki's test of the formula.
 */
export const COMMODITIES = ['food', 'wood', 'stone', 'iron'] as const
export type Commodity = (typeof COMMODITIES)[number]

/** Res enum order in the game: food 0, wood 1, stone 2, iron 3. */
const INDEX: Record<Commodity, number> = { food: 0, wood: 1, stone: 2, iron: 3 }

export function worldPrice(r: Commodity, ms: number, basePrice: Record<string, number>): number {
  const base = basePrice[r] ?? 1
  const h = ms / 3600000
  const i = INDEX[r] + 1
  const v = 1 + 0.08 * Math.sin((2 * Math.PI * h) / (23.0 + i * 1.7) + i * 1.3) + 0.04 * Math.sin((2 * Math.PI * h) / (6.1 + i * 0.9) + i * 2.1)
  return base * v
}

/** [hours] of prices up to [nowMs], [points] samples, oldest first. */
export function history(r: Commodity, nowMs: number, basePrice: Record<string, number>, hours = 24, points = 96): number[] {
  return Array.from({ length: points }, (_, k) => {
    const i = points - 1 - k
    return worldPrice(r, nowMs - Math.round((i * hours * 3600000) / (points - 1)), basePrice)
  })
}
