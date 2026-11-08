/** The game's trophy offer (horizon_core gen/base_generator.dart → trophyOffer). */
export function trophyOffer(mine: number, theirs: number): { win: number; loss: number } {
  const diff = theirs - mine
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  // Dart's round() takes halves away from zero; Math.round takes them up.
  const round = (v: number) => Math.sign(v) * Math.round(Math.abs(v))
  return { win: clamp(round(30 + diff / 10), 10, 60), loss: clamp(round(12 - diff / 15), 4, 24) }
}
