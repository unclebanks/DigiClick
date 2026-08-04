import type { Digimon } from '../../types/game'
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
      <div className={styles.requirements}>
        <p className={styles.label}>Requirements</p>
        {digimon.evolutionRequirements?.length ? (
          digimon.evolutionRequirements.map((requirement, index) => (
            <p key={`${digimon.id}-${index}`} className={styles.requirementText}>
              {requirement.notes ?? 'Template requirement placeholder.'}
            </p>
          ))
        ) : (
          <p className={styles.requirementText}>No template requirements yet.</p>
        )}
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
