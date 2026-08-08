import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { resolveDigimonProgression } from '../utils/digimonProgression'
import { createInitialDigivolutionState } from '../utils/evolution'
import styles from '../styles/pages.module.css'

export function PartyPage() {
  const partyDigimon = useGameStore((state) => state.partyDigimon)
  const digitalSpace = useGameStore((state) => state.digitalSpace)
  const digimonProgression = useGameStore((state) => state.digimonProgression)
  const digivolutionStates = useGameStore((state) => state.digivolutionStates)
  const moveToParty = useGameStore((state) => state.moveToParty)
  const moveToDigitalSpace = useGameStore((state) => state.moveToDigitalSpace)

  // partyDigimon/digitalSpace store instance ids, not species ids directly - a species can be
  // owned more than once, so the species itself always comes from the digivolution state.
  const resolveMember = (baseId: string) => {
    const digivolutionState = digivolutionStates[baseId] ?? createInitialDigivolutionState(baseId)
    const species = sampleDigimon.find((digimon) => digimon.id === digivolutionState.currentFormId)
    const progression = resolveDigimonProgression(digimonProgression[baseId])

    return species ? { baseId, species, progression } : null
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
          {partyMembers.map(({ baseId, species }) => (
            <div key={baseId} className={styles.cardListItem}>
              <strong>{species.name}</strong>
              <p>{species.stage}</p>
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
