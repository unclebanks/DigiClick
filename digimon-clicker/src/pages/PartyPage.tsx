import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { resolveDigimonProgression } from '../utils/digimonProgression'
import styles from '../styles/pages.module.css'

export function PartyPage() {
  const partyDigimon = useGameStore((state) => state.partyDigimon)
  const digitalSpace = useGameStore((state) => state.digitalSpace)
  const digimonProgression = useGameStore((state) => state.digimonProgression)
  const moveToParty = useGameStore((state) => state.moveToParty)
  const moveToDigitalSpace = useGameStore((state) => state.moveToDigitalSpace)

  const partyMembers = sampleDigimon
    .filter((digimon) => partyDigimon.includes(digimon.id))
    .map((digimon) => ({
      ...digimon,
      ...resolveDigimonProgression(digimonProgression[digimon.id]),
    }))
  const storedDigimon = digitalSpace.flatMap((environment) =>
    environment.digimonIds.map((digimonId) => ({
      digimonId,
      environmentName: environment.name,
    })),
  )

  return (
    <div className={styles.page}>
      <Card title="Party">
        <p>Party size: {partyDigimon.length}/6</p>
        <div className={styles.grid}>
          {partyMembers.map((digimon) => (
            <div key={digimon.id} className={styles.cardListItem}>
              <strong>{digimon.name}</strong>
              <p>{digimon.stage}</p>
              <Button variant="secondary" onClick={() => moveToDigitalSpace(digimon.id)}>
                Send to Digital Space
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Digital Space">
        <p>30 environments with a cap of 30 Digimon each.</p>
        <div className={styles.grid}>
          {storedDigimon.map((entry) => {
            const digimon = sampleDigimon.find((candidate) => candidate.id === entry.digimonId)
            return (
              <div key={`${entry.digimonId}-${entry.environmentName}`} className={styles.cardListItem}>
                <strong>{digimon?.name ?? entry.digimonId}</strong>
                <p>{entry.environmentName}</p>
                <Button variant="secondary" onClick={() => moveToParty(entry.digimonId)}>
                  Bring to Party
                </Button>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
