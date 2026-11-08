import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import game from '../data/game.json'
import { buildingLooks, looks, troopLooks } from './game'
import { worldPrice, type Commodity } from './market'
import { trophyOffer } from './trophies'

const pub = join(import.meta.dirname, '..', '..', 'public', 'art')
const slug = (s: string) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

describe('ports of the game’s formulas match the game', () => {
  it('worldPrice equals the Dart values dumped from horizon_core', () => {
    for (const s of game.marketSamples) {
      expect(worldPrice(s.res as Commodity, s.ms, game.market.basePrice)).toBeCloseTo(s.price, 9)
    }
  })
  it('trophyOffer equals the Dart values', () => {
    for (const s of game.trophySamples) expect(trophyOffer(s.mine, s.theirs)).toEqual({ win: s.win, loss: s.loss })
  })
})

describe('the data is complete', () => {
  it('every building has its pictures, and each listed one exists', () => {
    for (const b of game.buildings) {
      const have = looks.buildings[b.key] ?? []
      expect(have.length, b.key).toBeGreaterThan(0)
      for (const l of have) expect(existsSync(join(pub, 'levels', 'buildings', `${b.key}_${l.level}.webp`)), `${b.key} ${l.level}`).toBe(true)
    }
  })
  it('every troop and hero has its level-1 picture, and each listed one exists', () => {
    for (const t of [...game.troops, game.lord, game.lady]) {
      const have = looks.troops[t.key]
      expect(have?.levels[0], t.key).toBe(1)
      for (const l of have.levels) expect(existsSync(join(pub, 'levels', 'troops', `${t.key}_${l}.webp`)), `${t.key} ${l}`).toBe(true)
    }
  })
  it('every troop, the Lord and the Lady have a portrait and a card', () => {
    for (const t of [...game.troops, game.lord, game.lady]) {
      expect(existsSync(join(pub, 'portraits', `${t.key}.webp`)), t.key).toBe(true)
      expect(existsSync(join(pub, 'cards', `${t.key}.webp`)), t.key).toBe(true)
    }
  })
  it('every stronghold’s company is made of known troops', () => {
    // Strongholds may lend either hero (0.28.1 campaign).
    const ids = new Set([...game.troops, game.lord, ...(game.lady ? [game.lady] : [])].map((t) => t.id))
    for (const s of game.campaign.strongholds) for (const k of Object.keys(s.army)) expect(ids.has(k), `${s.name}: ${k}`).toBe(true)
  })
  it('page slugs are unique', () => {
    for (const list of [game.buildings, game.troops, game.campaign.strongholds]) {
      const slugs = list.map((x) => slug(x.name))
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })
  it('there are 50 strongholds worth 150 stars', () => {
    expect(game.campaign.strongholds.length * 3).toBe(150)
  })
})

describe('How it looks: one picture per level', () => {
  it('a building (the Cannon) has one picture for each of its levels, in order', () => {
    const cannon = game.buildings.find((b) => b.key === 'cannon')!
    const items = buildingLooks(cannon)
    expect(items.map((i) => i.caption)).toEqual(cannon.levels.map((l) => `Level ${l.level}`))
    expect(new Set(items.map((i) => i.src)).size).toBe(cannon.levels.length)
    expect(items[2].alt).toBe('Cannon, level 3')
  })
  it('a troop (the Knight) has one picture for each of its levels, all the same size', () => {
    const knight = game.troops.find((t) => t.key === 'knight')!
    const items = troopLooks(knight)
    expect(items.map((i) => i.src)).toEqual(knight.levels.map((l) => `levels/troops/knight_${l.level}.webp`))
    expect(new Set(items.map((i) => `${i.w}x${i.h}@${i.gx},${i.gy}`)).size).toBe(1)
    expect(items[2].alt).toBe('Knight, level 3')
  })
  it('the gallery never shows cards or portraits', () => {
    for (const t of [...game.troops, game.lord, game.lady]) for (const i of troopLooks(t)) expect(i.src).toMatch(/^levels\/troops\//)
  })
})
