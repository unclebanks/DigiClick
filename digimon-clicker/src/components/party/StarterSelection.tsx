import { sampleDigimon } from '../../data/digimon'
import styles from './StarterSelection.module.css'

interface StarterSelectionProps {
  onSelect: (digimonId: string) => void
}

const starters = sampleDigimon.filter((digimon) => digimon.stage === 'Fresh')

export function StarterSelection({ onSelect }: StarterSelectionProps) {
  return (
    <section className={styles.panel}>
      <h2>Choose your first Digimon</h2>
      <p className={styles.copy}>No party was found, so you can select one starter from the Fresh line.</p>
      <div className={styles.grid}>
        {starters.map((digimon) => (
          <button key={digimon.id} type="button" className={styles.card} onClick={() => onSelect(digimon.id)}>
            <span className={styles.emoji}>{digimon.emoji}</span>
            <strong>{digimon.name}</strong>
            <span>{digimon.description}</span>
            <span className={styles.selectBadge}>Select</span>
          </button>
        ))}
      </div>
    </section>
  )
}
