import { Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { DigimonCard } from '../components/digimon/DigimonCard'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { ProgressBar } from '../components/common/ProgressBar'
import { StarterSelection } from '../components/party/StarterSelection'
import { getLevelProgress } from '../utils/game'
import { getPartyDigimonList } from '../utils/digimonParty'
import { resolveDigimonProgression } from '../utils/digimonProgression'
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
  const gainDigimonExperience = useGameStore((state) => state.gainDigimonExperience)
  const navigate = useNavigate()
  const partyMembers = getPartyDigimonList(sampleDigimon, partyDigimon).map((digimon) => ({
    ...digimon,
    ...resolveDigimonProgression(digimonProgression[digimon.id]),
  }))

  const handleEvolve = (digimonId: string) => {
    const currentFormId = digivolutionStates[digimonId] ?? digimonId
    const nextFormId = currentFormId === 'agumon' ? 'greymon' : currentFormId
    setDigivolutionState(digimonId, nextFormId)
  }

  const handleDedigivolve = (digimonId: string) => {
    const currentFormId = digivolutionStates[digimonId] ?? digimonId
    setDigivolutionState(digimonId, currentFormId === 'greymon' ? 'agumon' : currentFormId)
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
              <Button onClick={() => {
                addCurrency(10)
                if (partyDigimon[0]) {
                  gainDigimonExperience(partyDigimon[0], 20)
                }
              }}>
                Collect 10 Bits
              </Button>
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
          </Card>
        </section>
      )}

      <section className={styles.grid}>
        {partyMembers.map((digimon) => (
          <DigimonCard
            key={digimon.id}
            digimon={digimon}
            currentFormId={digivolutionStates[digimon.id] ?? digimon.id}
            onEvolve={handleEvolve}
            onDedigivolve={handleDedigivolve}
          />
        ))}
      </section>
    </div>
  )
}
