import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { consumableItems } from '../data/consumables'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { resolveDigimonProgression } from '../utils/digimonProgression'
import { createInitialDigivolutionState } from '../utils/evolution'
import { calculateDigimonStats, formatStatWithBonus } from '../utils/digimonStats'
import styles from '../styles/pages.module.css'

const augmentChipItems = consumableItems.filter((item) => item.mechanic?.kind === 'stat_augment')

export function PartyPage() {
  const partyDigimon = useGameStore((state) => state.partyDigimon)
  const digitalSpace = useGameStore((state) => state.digitalSpace)
  const digimonProgression = useGameStore((state) => state.digimonProgression)
  const digivolutionStates = useGameStore((state) => state.digivolutionStates)
  const digimonBonuses = useGameStore((state) => state.digimonBonuses)
  const inventory = useGameStore((state) => state.inventory)
  const moveToParty = useGameStore((state) => state.moveToParty)
  const moveToDigitalSpace = useGameStore((state) => state.moveToDigitalSpace)
  const applyStatAugment = useGameStore((state) => state.applyStatAugment)

  // partyDigimon/digitalSpace store instance ids, not species ids directly - a species can be
  // owned more than once, so the species itself always comes from the digivolution state.
  const resolveMember = (baseId: string) => {
    const digivolutionState = digivolutionStates[baseId] ?? createInitialDigivolutionState(baseId)
    const species = sampleDigimon.find((digimon) => digimon.id === digivolutionState.currentFormId)
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

    return { baseId, species, progression, stats, baseStats }
  }

  const partyMembers = partyDigimon
    .map(resolveMember)
    .filter((member): member is NonNullable<typeof member> => member !== null)

  const storedDigimon = digitalSpace.flatMap((environment) =>
    environment.digimonIds.map((digimonId) => ({
      member: resolveMember(digimonId),
      digimonId,
      environmentName: environment.name,
    })),
  )

  return (
    <div className={styles.page}>
      <Card title="Party">
        <p>Party size: {partyDigimon.length}/6</p>
        <div className={styles.grid}>
          {partyMembers.map(({ baseId, species, stats, baseStats }) => (
            <div key={baseId} className={styles.cardListItem}>
              <strong>{species.name}</strong>
              <p>{species.stage}</p>
              <p className={styles.statRow}>
                <span>ATK {formatStatWithBonus(baseStats.attack, stats.attack)}</span>
                <span>DEF {formatStatWithBonus(baseStats.defense, stats.defense)}</span>
                <span>SPD {formatStatWithBonus(baseStats.speed, stats.speed)}</span>
                <span>HP {formatStatWithBonus(baseStats.hp, stats.hp)}</span>
              </p>
              {augmentChipItems.some((item) => (inventory[item.id] ?? 0) > 0) && (
                <div>
                  <p className={styles.dexText}>Use an Augment Chip:</p>
                  <div className={styles.actions}>
                    {augmentChipItems
                      .filter((item) => (inventory[item.id] ?? 0) > 0)
                      .map((item) => (
                        <Button key={item.id} variant="secondary" onClick={() => applyStatAugment(baseId, item.id)}>
                          {item.name} (x{inventory[item.id]})
                        </Button>
                      ))}
                  </div>
                </div>
              )}
              <Button variant="secondary" onClick={() => moveToDigitalSpace(baseId)}>
                Send to Digital Space
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Digital Space">
        <p>30 environments with a cap of 30 Digimon each.</p>
        <div className={styles.grid}>
          {storedDigimon.map((entry) => (
            <div key={`${entry.digimonId}-${entry.environmentName}`} className={styles.cardListItem}>
              <strong>{entry.member?.species.name ?? entry.digimonId}</strong>
              <p>{entry.environmentName}</p>
              <Button variant="secondary" onClick={() => moveToParty(entry.digimonId)}>
                Bring to Party
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

