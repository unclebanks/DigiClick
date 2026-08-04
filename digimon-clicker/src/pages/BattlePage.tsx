import { Sword } from 'lucide-react'
import { useState } from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { useGameStore } from '../store/gameStore'
import { resolveBattleTurn } from '../utils/combat'
import styles from '../styles/pages.module.css'

const initialEnemyHp = 24

export function BattlePage() {
  const [enemyHp, setEnemyHp] = useState(initialEnemyHp)
  const [battleLog, setBattleLog] = useState('A rookie Digimon is blocking your path.')
  const addCurrency = useGameStore((state) => state.addCurrency)
  const playerLevel = useGameStore((state) => state.playerLevel)

  const handleAttack = () => {
    const power = 4 + playerLevel
    const result = resolveBattleTurn(power, enemyHp)

    if (result.defeated) {
      setEnemyHp(initialEnemyHp)
      setBattleLog(`Victory! You earned ${result.reward} Bits.`)
      addCurrency(result.reward)
      return
    }

    setEnemyHp(result.enemyHp)
    setBattleLog(`You hit for ${power} damage. Enemy HP: ${result.enemyHp}.`)
  }

  return (
    <div className={styles.page}>
      <Card title="Battle Arena">
        <div className={styles.battlePanel}>
          <div className={styles.battleEnemy}>
            <p className={styles.eyebrow}>Wild encounter</p>
            <h2>Koromon</h2>
            <p>HP: {enemyHp}</p>
          </div>

          <div className={styles.battleControls}>
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
