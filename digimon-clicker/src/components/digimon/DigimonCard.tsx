import type { Digimon, Evolution } from '../../types/game'
import { formatEvolutionRequirements } from '../../utils/evolution'
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
  evolutionOptions?: EvolutionOption[]
  canDedigivolve?: boolean
  onEvolve?: (toId: string) => void
  onDedigivolve?: () => void
}

export function DigimonCard({
  digimon,
  level,
  exp,
  expToNextLevel,
  evolutionOptions = [],
  canDedigivolve = false,
  onEvolve,
  onDedigivolve,
}: DigimonCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.emoji}>{digimon.emoji}</div>
      <div>
        <h3>{digimon.name}</h3>
        <p>{digimon.stage}</p>
      </div>
      <p className={styles.description}>{digimon.description}</p>
      <p className={styles.power}>Power {digimon.basePower}</p>
      <p className={styles.requirementText}>Personality: {digimon.personality}</p>
      <p className={styles.requirementText}>Attribute: {digimon.type}</p>
      <div className={styles.statsGrid}>
        <span>Lv. {level}</span>
        <span>ATK {digimon.baseStats.attack}</span>
        <span>DEF {digimon.baseStats.defense}</span>
        <span>SPD {digimon.baseStats.speed}</span>
        <span>HP {digimon.baseStats.hp}</span>
      </div>
      <p className={styles.exp}>EXP {exp}/{expToNextLevel}</p>
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

