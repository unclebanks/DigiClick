import type { Digimon } from '../../types/game'
import { formatEvolutionRequirements } from '../../utils/evolution'
import styles from './DigimonCard.module.css'

interface DigimonCardProps {
  digimon: Digimon
  currentFormId?: string
  onEvolve?: (digimonId: string) => void
  onDedigivolve?: (digimonId: string) => void
}

export function DigimonCard({
  digimon,
  currentFormId,
  onEvolve,
  onDedigivolve,
}: DigimonCardProps) {
  const isActive = currentFormId === digimon.id

  return (
    <article className={`${styles.card} ${isActive ? styles.active : ''}`}>
      <div className={styles.emoji}>{digimon.emoji}</div>
      <div>
        <h3>{digimon.name}</h3>
        <p>{digimon.stage}</p>
      </div>
      <p className={styles.description}>{digimon.description}</p>
      <p className={styles.power}>Power {digimon.basePower}</p>
      <p className={styles.requirementText}>Personality: {digimon.personality}</p>
      <p className={styles.requirementText}>Type: {digimon.type}</p>
      <div className={styles.statsGrid}>
        <span>Lv. {digimon.level}</span>
        <span>ATK {digimon.baseStats.attack}</span>
        <span>DEF {digimon.baseStats.defense}</span>
        <span>SPD {digimon.baseStats.speed}</span>
        <span>HP {digimon.baseStats.hp}</span>
      </div>
      <p className={styles.exp}>EXP {digimon.exp}/{digimon.expToNextLevel}</p>
      <div className={styles.requirements}>
        <p className={styles.label}>Requirements</p>
        <p className={styles.requirementText}>
          {formatEvolutionRequirements(digimon.evolutionRequirements)}
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => onEvolve?.(digimon.id)}>
          Digivolve
        </button>
        <button type="button" className={styles.buttonSecondary} onClick={() => onDedigivolve?.(digimon.id)}>
          De-Digivolve
        </button>
      </div>
    </article>
  )
}
