import { describe, expect, it } from 'vitest'
import { evolutionItems } from './evolutionItems'

describe('evolutionItems', () => {
  it('has a unique id for every item', () => {
    const ids = evolutionItems.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every item a positive price', () => {
    for (const item of evolutionItems) {
      expect(item.price).toBeGreaterThan(0)
    }
  })

  it('matches the Evolution-type row count from examples/ItemTable.csv', () => {
    expect(evolutionItems).toHaveLength(15)
  })
})
