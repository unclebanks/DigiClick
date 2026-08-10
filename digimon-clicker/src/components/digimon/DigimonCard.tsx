import type { Digimon, DigimonStats, Evolution } from '../../types/game'
import { formatEvolutionRequirements } from '../../utils/evolution'
import { formatStatWithBonus } from '../../utils/digimonStats'
import styles from './DigimonCard.module.css'

interface EvolutionOption {
  evolution: Evolution
  targetName: string
  satisfied: boolean
}

interface DigimonCardProps {
  digimon: Digimon
  level: number
  exp: number
  expToNextLevel: number
  // Leveled stats before/after any permanent scan or Augment Chip bonus - used to render each stat
  // as "Normal (+Boost)". Falls back to the species' raw level-1 baseStats when omitted.
  stats?: DigimonStats
  baseStats?: DigimonStats
  evolutionOptions?: EvolutionOption[]
  canDedigivolve?: boolean
  showDescription?: boolean
  onEvolve?: (toId: string) => void
  onDedigivolve?: () => void
}

export function DigimonCard({
  digimon,
  level,
  exp,
  expToNextLevel,
  stats,
  baseStats,
  evolutionOptions = [],
  canDedigivolve = false,
  showDescription = true,
  onEvolve,
  onDedigivolve,
}: DigimonCardProps) {
  const displayedBaseStats = baseStats ?? digimon.baseStats
  const displayedStats = stats ?? displayedBaseStats

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.emoji}>{digimon.emoji}</div>
        <div className={styles.identity}>
          <h3>{digimon.name}</h3>
          <p className={styles.stage}>{digimon.stage}</p>
        </div>
        <div className={styles.statsGrid}>
          <span>Lv. {level}</span>
          <span>ATK {formatStatWithBonus(displayedBaseStats.attack, displayedStats.attack)}</span>
          <span>DEF {formatStatWithBonus(displayedBaseStats.defense, displayedStats.defense)}</span>
          <span>SPD {formatStatWithBonus(displayedBaseStats.speed, displayedStats.speed)}</span>
          <span>HP {formatStatWithBonus(displayedBaseStats.hp, displayedStats.hp)}</span>
        </div>
        <p className={styles.exp}>EXP {exp}/{expToNextLevel}</p>
      </div>
      {showDescription && <p className={styles.description}>{digimon.description}</p>}
      <p className={styles.power}>Power {digimon.basePower}</p>
      <p className={styles.requirementText}>{digimon.personality} - {digimon.type}</p>
      <div className={styles.requirements}>
        <p className={styles.label}>Evolution options</p>
        {evolutionOptions.length === 0 ? (
          <p className={styles.requirementText}>No further evolutions available yet.</p>
        ) : (
          evolutionOptions.map(({ evolution, targetName, satisfied }) => (
            <div key={evolution.id} className={styles.evolutionOption}>
              <p className={styles.requirementText}>
                {targetName} ({evolution.cost} Bits) - {formatEvolutionRequirements(evolution.requires)}
              </p>
              <button
                type="button"
                className={styles.button}
                disabled={!satisfied}
                onClick={() => onEvolve?.(evolution.to)}
              >
                Digivolve to {targetName}
              </button>
            </div>
          ))
        )}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.buttonSecondary}
          disabled={!canDedigivolve}
          onClick={() => onDedigivolve?.()}
        >
          De-Digivolve
        </button>
      </div>
    </article>
  )
}

