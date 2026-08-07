import { Sword } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { sampleBattleRoutes } from '../data/areas'
import { getDefaultBattleRoute, isRouteUnlocked } from '../utils/battleRoutes'
import { resolveBattleTurn } from '../utils/combat'
import styles from '../styles/pages.module.css'

const initialEnemyHp = 24

export function BattlePage() {
  const [enemyHp, setEnemyHp] = useState(initialEnemyHp)
  const [battleLog, setBattleLog] = useState('Select a route and challenge the wild Digimon ahead.')
  const [activeRouteId, setActiveRouteId] = useState(getDefaultBattleRoute(sampleBattleRoutes).id)
  const addCurrency = useGameStore((state) => state.addCurrency)
  const addInventoryItem = useGameStore((state) => state.addInventoryItem)
  const playerLevel = useGameStore((state) => state.playerLevel)

  const currentRoute = useMemo(
    () => sampleBattleRoutes.find((route) => route.id === activeRouteId) ?? getDefaultBattleRoute(sampleBattleRoutes),
    [activeRouteId],
  )

  const encounterOptions = useMemo(
    () => currentRoute.encounterIds.map((id) => sampleDigimon.find((digimon) => digimon.id === id)).filter(Boolean),
    [currentRoute],
  )

  const activeEncounter = encounterOptions[0]

  const handleAttack = () => {
    const power = 4 + playerLevel
    const result = resolveBattleTurn(power, enemyHp, activeEncounter?.drops)

    if (result.defeated) {
      setEnemyHp(initialEnemyHp)

      if (result.droppedItemIds.length) {
        result.droppedItemIds.forEach((itemId) => addInventoryItem(itemId))
        setBattleLog(`Victory! You earned ${result.reward} Bits and found ${result.droppedItemIds.join(', ')}.`)
      } else {
        setBattleLog(`Victory! You earned ${result.reward} Bits.`)
      }

      addCurrency(result.reward)
      return
    }

    setEnemyHp(result.enemyHp)
    setBattleLog(`You hit for ${power} damage. Enemy HP: ${result.enemyHp}.`)
  }

  const handleRouteSelect = (routeId: string) => {
    const nextRoute = sampleBattleRoutes.find((route) => route.id === routeId)

    if (!nextRoute || !isRouteUnlocked(nextRoute, playerLevel)) {
      setBattleLog('That route is still locked. Train a little more and build your party.')
      return
    }

    setActiveRouteId(routeId)
    setEnemyHp(initialEnemyHp)
    setBattleLog(`You entered ${nextRoute.region} - ${nextRoute.name}.`)
  }

  return (
    <div className={styles.page}>
      <Card title="Battle Routes">
        <div className={styles.battlePanel}>
          <div className={styles.battleEnemy}>
            <p className={styles.eyebrow}>Wild encounter</p>
            <h2>{activeEncounter?.name ?? 'No encounter'}</h2>
            <p>{currentRoute.region} • {currentRoute.name}</p>
            <p>HP: {enemyHp}</p>
            <p>{currentRoute.description}</p>
          </div>

          <div className={styles.battleControls}>
            <div className={styles.actions}>
              {sampleBattleRoutes.map((route) => (
                <Button
                  key={route.id}
                  variant={route.id === currentRoute.id ? 'primary' : 'secondary'}
                  onClick={() => handleRouteSelect(route.id)}
                >
                  {route.name}
                </Button>
              ))}
            </div>
            <Button onClick={handleAttack}>
              <Sword size={16} /> Attack
            </Button>
            <p className={styles.battleLog}>{battleLog}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
