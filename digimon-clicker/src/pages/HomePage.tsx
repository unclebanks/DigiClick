import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { sampleEvolutions } from '../data/evolutions'
import { DigimonCard } from '../components/digimon/DigimonCard'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { ProgressBar } from '../components/common/ProgressBar'
import { StarterSelection } from '../components/party/StarterSelection'
import { getLevelProgress } from '../utils/game'
import { resolveDigimonProgression } from '../utils/digimonProgression'
import { calculateDigimonStats } from '../utils/digimonStats'
import {
  canSatisfyEvolutionRequirements,
  createInitialDigivolutionState,
  dedigivolveDigimonState,
  evolveDigimonState,
  getEvolutionOptions,
} from '../utils/evolution'
import type { DigivolutionState } from '../types/game'
import styles from '../styles/pages.module.css'

export function HomePage() {
  const currency = useGameStore((state) => state.currency)
  const playerLevel = useGameStore((state) => state.playerLevel)
  const currentArea = useGameStore((state) => state.currentArea)
  const addCurrency = useGameStore((state) => state.addCurrency)
  const setDigivolutionState = useGameStore((state) => state.setDigivolutionState)
  const digivolutionStates = useGameStore((state) => state.digivolutionStates)
  const partyDigimon = useGameStore((state) => state.partyDigimon)
  const selectStarter = useGameStore((state) => state.selectStarter)
  const digimonProgression = useGameStore((state) => state.digimonProgression)
  const resetDigimonProgression = useGameStore((state) => state.resetDigimonProgression)
  const digimonBonuses = useGameStore((state) => state.digimonBonuses)
  const inventory = useGameStore((state) => state.inventory)
  const badges = useGameStore((state) => state.badges)
  const statistics = useGameStore((state) => state.statistics)
  const navigate = useNavigate()

  const partyMembers = partyDigimon
    .map((baseId) => {
      const digivolutionState = digivolutionStates[baseId] ?? createInitialDigivolutionState(baseId)
      const species = sampleDigimon.find((digimon) => digimon.id === digivolutionState.currentFormId)
        ?? sampleDigimon.find((digimon) => digimon.id === baseId)
      const progression = resolveDigimonProgression(digimonProgression[baseId])

      if (!species) {
        return null
      }

      const bonus = digimonBonuses[baseId]
      const baseStats = calculateDigimonStats(
        species.baseStats,
        progression.level,
        { statMultiplier: digivolutionState.penaltyMultiplier },
        species.growthStats,
      )
      const stats = calculateDigimonStats(
        species.baseStats,
        progression.level,
        {
          statMultiplier: digivolutionState.penaltyMultiplier,
          attackBonus: bonus?.attack,
          defenseBonus: bonus?.defense,
          speedBonus: bonus?.speed,
          hpBonus: bonus?.hp,
          spBonus: bonus?.sp,
          intBonus: bonus?.int,
          spiBonus: bonus?.spi,
        },
        species.growthStats,
      )

      return { baseId, digivolutionState, species, progression, stats, baseStats }
    })
    .filter((member): member is NonNullable<typeof member> => member !== null)

  const handleEvolve = (baseId: string, digivolutionState: DigivolutionState, toId: string) => {
    const evolution = sampleEvolutions.find(
      (entry) => entry.from === digivolutionState.currentFormId && entry.to === toId,
    )
    const progression = resolveDigimonProgression(digimonProgression[baseId])
    const member = partyMembers.find((entry) => entry.baseId === baseId)

    if (!evolution) {
      return
    }

    const satisfied = canSatisfyEvolutionRequirements(evolution.requires, {
      level: progression.level,
      inventory,
      currentAreaId: currentArea,
      badges,
      stats: member?.stats,
    })

    if (!satisfied || currency < evolution.cost) {
      return
    }

    addCurrency(-evolution.cost)
    setDigivolutionState(baseId, evolveDigimonState(digivolutionState, toId))
    resetDigimonProgression(baseId)
  }

  const handleDedigivolve = (baseId: string, digivolutionState: DigivolutionState) => {
    setDigivolutionState(baseId, dedigivolveDigimonState(digivolutionState))
  }

  const handleStarterSelect = (digimonId: string) => {
    selectStarter(digimonId)
  }

  return (
    <div className={styles.page}>
      {partyDigimon.length === 0 ? (
        <StarterSelection onSelect={handleStarterSelect} />
      ) : (
        <section className={styles.heroPanel}>
          <div>
            <p className={styles.eyebrow}>
              <Sparkles size={16} /> Digimon Clicker
            </p>
            <h1>Collect, battle, and evolve your team.</h1>
            <p className={styles.lead}>
              This template keeps the first steps simple so you can focus on learning the game loop.
            </p>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => navigate('/battle')}>
                Enter Battle
              </Button>
            </div>
          </div>
          <Card title="Adventure Status">
            <p>Currency: {currency}</p>
            <p>Level: {playerLevel}</p>
            <p>Area: {currentArea}</p>
            <ProgressBar label="Adventure progress" value={getLevelProgress(playerLevel, currency)} />
            <p className={styles.statRow}>
              <span>Encountered {statistics.encountered}</span>
              <span>Defeated {statistics.defeated}</span>
              <span>Badges {Object.keys(badges).length}</span>
            </p>
            <p className={styles.statRow}>
              <span>Bits earned {statistics.bitsEarned}</span>
              <span>Total EXP {statistics.totalExpEarned}</span>
              <span>Crits {statistics.criticalHits}</span>
              <span>Misses {statistics.misses}</span>
            </p>
          </Card>
        </section>
      )}

      <section className={styles.partyList}>
        {partyMembers.map(({ baseId, digivolutionState, species, progression, stats, baseStats }) => (
          <DigimonCard
            key={baseId}
            digimon={species}
            level={progression.level}
            exp={progression.exp}
            expToNextLevel={progression.expToNextLevel}
            stats={stats}
            baseStats={baseStats}
            canDedigivolve={digivolutionState.history.length > 1}
            showDescription={false}
            evolutionOptions={getEvolutionOptions(digivolutionState.currentFormId, sampleEvolutions).map((evolution) => ({
              evolution,
              targetName: sampleDigimon.find((digimon) => digimon.id === evolution.to)?.name ?? evolution.to,
              satisfied: canSatisfyEvolutionRequirements(evolution.requires, {
                level: progression.level,
                inventory,
                currentAreaId: currentArea,
                badges,
                stats,
              }),
            }))}
            onEvolve={(toId) => handleEvolve(baseId, digivolutionState, toId)}
            onDedigivolve={() => handleDedigivolve(baseId, digivolutionState)}
          />
        ))}
      </section>
    </div>
  )
}

