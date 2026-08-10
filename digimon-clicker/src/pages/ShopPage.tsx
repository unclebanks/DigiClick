import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { sampleItems } from '../data/items'
import { consumableItems } from '../data/consumables'
import { evolutionItems } from '../data/evolutionItems'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import type { Item } from '../types/game'
import styles from '../styles/pages.module.css'

interface ShopSectionProps {
  title: string
  items: Item[]
  currency: number
  inventory: Record<string, number>
  onBuy: (item: Item) => void
}

function ShopSection({ title, items, currency, inventory, onBuy }: ShopSectionProps) {
  return (
    <Card title={title}>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.cardListItem}>
            <strong>{item.name}</strong>
            <p className={styles.dexText}>{item.effect}</p>
            <p className={styles.statRow}>
              <span>{item.price} Bits</span>
              {(inventory[item.id] ?? 0) > 0 && <span>Owned x{inventory[item.id]}</span>}
            </p>
            <Button variant="secondary" disabled={currency < item.price} onClick={() => onBuy(item)}>
              Buy
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ShopPage() {
  const currency = useGameStore((state) => state.currency)
  const inventory = useGameStore((state) => state.inventory)
  const addCurrency = useGameStore((state) => state.addCurrency)
  const addInventoryItem = useGameStore((state) => state.addInventoryItem)
  const [lastPurchase, setLastPurchase] = useState<string | null>(null)

  // Shop is unrestricted for testing - every item defined anywhere in src/data is purchasable
  // here regardless of category, area, or level; no stock limits or unlock gates yet.
  const handleBuy = (item: Item) => {
    if (currency < item.price) {
      setLastPurchase(`Not enough Bits for ${item.name}.`)
      return
    }

    addCurrency(-item.price)
    addInventoryItem(item.id)
    setLastPurchase(`Purchased ${item.name}.`)
  }

  return (
    <div className={styles.page}>
      <Card title="Shop">
        <p>Currency: {currency} Bits</p>
        <p className={styles.dexText}>Everything is purchasable for testing - no stock limits or unlock gates yet.</p>
        {lastPurchase && <p className={styles.dexText}>{lastPurchase}</p>}
      </Card>
      <ShopSection title="Items" items={sampleItems} currency={currency} inventory={inventory} onBuy={handleBuy} />
      <ShopSection title="Consumables" items={consumableItems} currency={currency} inventory={inventory} onBuy={handleBuy} />
      <ShopSection title="Evolution Materials" items={evolutionItems} currency={currency} inventory={inventory} onBuy={handleBuy} />
    </div>
  )
}
