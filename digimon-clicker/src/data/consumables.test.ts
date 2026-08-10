import { describe, expect, it } from 'vitest'
import { consumableItems } from './consumables'

describe('consumableItems', () => {
  it('has a unique id for every item', () => {
    const ids = consumableItems.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every item a positive price and a mechanic/target pair', () => {
    for (const item of consumableItems) {
      expect(item.price).toBeGreaterThan(0)
      expect(item.mechanic).toBeDefined()
      expect(item.target).toBeDefined()
      expect(item.targetType).toBe('ally')
    }
  })

  it('matches the CSV row count from examples/ConsumableTable.csv', () => {
    expect(consumableItems).toHaveLength(65)
  })
})
