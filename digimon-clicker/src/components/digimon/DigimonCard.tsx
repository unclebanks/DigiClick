import { Fragment } from 'react'
import type { Digimon, DigivolutionChainEntry, DigimonStats, Evolution } from '../../types/game'
import { sampleDigimon } from '../../data/digimon'
import { formatEvolutionRequirements } from '../../utils/evolution'
import { formatStatWithBonus } from '../../utils/digimonStats'
import { ProgressBar } from '../common/ProgressBar'
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
  // Every form this instance has ever been in, in chronological order, each tagged with how it
  // got there (see DigivolutionState.digivolutionChain) - rendered as an icon strip with a ">"
  // (digivolved) or "<" (de-digivolved) between consecutive icons. Falls back to just the current
  // form when omitted.
  digivolutionChain?: DigivolutionChainEntry[]
  evolutionOptions?: EvolutionOption[]
  canDedigivolve?: boolean
  showDescription?: boolean
  onEvolve?: (toId: string) => void
  onDedigivolve?: () => void
}

// Optional stats (sp/int/spi) only render when the species actually has them - some manually
// authored fallback Digimon (see src/data/digimon.ts) don't carry these fields.
const OPTIONAL_STAT_ROWS = [
  { key: 'sp', label: 'SP' },
  { key: 'int', label: 'INT' },
  { key: 'spi', label: 'SPI' },
] as const

export function DigimonCard({
  digimon,
  level,
  exp,
  expToNextLevel,
  stats,
  baseStats,
  digivolutionChain = [{ formId: digimon.id }],
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
      <div className={styles.topRow}>
        <div className={styles.topRowMain}>
          <div className={styles.chain}>
            {digivolutionChain.map((entry, index) => {
              const formSpecies = entry.formId === digimon.id ? digimon : sampleDigimon.find((species) => species.id === entry.formId)

              if (!formSpecies) {
                return null
              }

              return (
                <Fragment key={`${entry.formId}-${index}`}>
                  {index > 0 && (
                    <span className={styles.chainArrow} aria-hidden="true">
                      {entry.direction === 'down' ? '<' : '>'}
                    </span>
                  )}
                  <span className={styles.chainIcon} title={formSpecies.name}>
                    {formSpecies.emoji}
                  </span>
                </Fragment>
              )
            })}
          </div>
          <h3 className={styles.name}>{digimon.name}</h3>
          <span className={styles.stage}>{digimon.stage}</span>
        </div>
        <div className={styles.topRowMeta}>
          <span className={styles.power}>Power {digimon.basePower}</span>
          <span className={styles.type}>{digimon.type}</span>
        </div>
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.leftColumn}>
          {showDescription && <p className={styles.description}>{digimon.description}</p>}
          <p className={styles.requirementText}>{digimon.personality}</p>
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
        </div>
        <div className={styles.statsPanel}>
          <p className={styles.levelLabel}>Lv. {level}</p>
          {/* Bond isn't implemented yet - always shows 0% until a real bond/friendship system exists. */}
          <ProgressBar label="Bond" value={0} />
          <div className={styles.statsTables}>
            <div className={styles.statsTable}>
              <span>ATK</span>
              <span>{formatStatWithBonus(displayedBaseStats.attack, displayedStats.attack)}</span>
              <span>DEF</span>
              <span>{formatStatWithBonus(displayedBaseStats.defense, displayedStats.defense)}</span>
              <span>SPD</span>
              <span>{formatStatWithBonus(displayedBaseStats.speed, displayedStats.speed)}</span>
              <span>HP</span>
              <span>{formatStatWithBonus(displayedBaseStats.hp, displayedStats.hp)}</span>
            </div>
            <div className={styles.statsTable}>
              {OPTIONAL_STAT_ROWS.filter(({ key }) => displayedStats[key] !== undefined).map(({ key, label }) => (
                <Fragment key={key}>
                  <span>{label}</span>
                  <span>{formatStatWithBonus(displayedBaseStats[key] ?? 0, displayedStats[key] ?? 0)}</span>
                </Fragment>
              ))}
            </div>
          </div>
          <ProgressBar label="EXP" value={exp} max={expToNextLevel} displayValue={`${exp}/${expToNextLevel}`} />
        </div>
      </div>
    </article>
  )
}

