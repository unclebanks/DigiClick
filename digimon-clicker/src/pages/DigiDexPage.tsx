import { useMemo, useState } from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { ProgressBar } from '../components/common/ProgressBar'
import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { getDigidexStatus, getOwnedDigimonIds } from '../utils/digidex'
import { SCAN_MAX, SCAN_RECRUIT_THRESHOLD, getScanBonusRatio, hasBonusScanTier } from '../utils/scanning'
import styles from '../styles/pages.module.css'

const STATUS_LABEL = {
  unseen: 'Unseen',
  scanned: 'Scanning',
  ready: 'Ready to recruit',
  owned: 'Owned',
} as const

// Fixed display order for the stage filter - digimon_cleaned.json's generation tiers, not
// whatever order they happen to appear in sampleDigimon.
const STAGE_ORDER = ['Fresh', 'In-Training', 'Rookie', 'Champion', 'Armor', 'Hybrid', 'Ultimate', 'Mega', 'Mega +']

export function DigiDexPage() {
  const partyDigimon = useGameStore((state) => state.partyDigimon)
  const digitalSpace = useGameStore((state) => state.digitalSpace)
  const digivolutionStates = useGameStore((state) => state.digivolutionStates)
  const scanProgress = useGameStore((state) => state.scanProgress)
  const recruitFromScan = useGameStore((state) => state.recruitFromScan)

  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  // The full roster is 481 entries (see docs/implemented-features.md) - defaulting unseen ones out
  // of the grid keeps the page from rendering hundreds of "???" cards before a save has explored
  // much of it. Players can opt back in once they want to browse everything.
  const [showUnseen, setShowUnseen] = useState(false)

  const ownedIds = getOwnedDigimonIds(partyDigimon, digitalSpace, digivolutionStates)
  const entries = sampleDigimon.map((digimon) => {
    const isOwned = ownedIds.has(digimon.id)
    const hasBeenSeen = isOwned || digimon.id in scanProgress
    const scanValue = scanProgress[digimon.id] ?? 0
    const status = getDigidexStatus({ hasBeenSeen, isOwned, scanProgress: scanValue })
    // Owning a species doesn't stop the scan meter from filling further, so it can always be
    // recruited again once it crosses the threshold.
    const canRecruit = scanValue >= SCAN_RECRUIT_THRESHOLD

    return { digimon, status, scanValue, canRecruit }
  })
  const loggedCount = entries.filter((entry) => entry.status !== 'unseen').length

  const stageOptions = useMemo(
    () => STAGE_ORDER.filter((stage) => sampleDigimon.some((digimon) => digimon.stage === stage)),
    [],
  )

  const visibleEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return entries.filter(({ digimon, status }) => {
      if (status === 'unseen' && !showUnseen) {
        return false
      }

      if (stageFilter !== 'All' && digimon.stage !== stageFilter) {
        return false
      }

      return query === '' || digimon.name.toLowerCase().includes(query)
    })
  }, [entries, searchQuery, stageFilter, showUnseen])

  return (
    <div className={styles.page}>
      <Card title="DigiDex">
        <p className={styles.lead}>
          {loggedCount}/{sampleDigimon.length} Digimon logged. Defeating a wild Digimon in battle adds to its scan
          percentage - the tougher the Digimon, the more data you gather per defeat. Once a species reaches 100%
          it can be recruited, even if you already own one - the scan meter resets afterward so you can work
          toward recruiting another. Scanning past 100% (up to 200%) grants a growing stat bonus to the next recruit.
        </p>
        <div className={styles.dexFilters}>
          <input
            type="text"
            className={styles.dexSearchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search DigiDex by name"
          />
          <select
            className={styles.regionSelect}
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            aria-label="Filter DigiDex by stage"
          >
            <option value="All">All stages</option>
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <label className={styles.dexToggle}>
            <input type="checkbox" checked={showUnseen} onChange={(event) => setShowUnseen(event.target.checked)} />
            Show unseen
          </label>
        </div>
        <p className={styles.dexText}>Showing {visibleEntries.length} of {sampleDigimon.length}.</p>
        <div className={styles.grid}>
          {visibleEntries.map(({ digimon, status, scanValue, canRecruit }) => (
            <div
              key={digimon.id}
              className={`${styles.cardListItem} ${status === 'unseen' ? styles.dexEntryUnseen : ''}`}
            >
              <div className={styles.dexEmoji}>{status === 'unseen' ? '❔' : digimon.emoji}</div>
              <h3>{status === 'unseen' ? '???' : digimon.name}</h3>
              <p className={styles.dexStatus}>{STATUS_LABEL[status]}</p>
              {status === 'unseen' ? (
                <p className={styles.dexText}>No data yet - encounter this Digimon in battle first.</p>
              ) : (
                <>
                  <p className={styles.dexText}>{digimon.description}</p>
                  <p className={styles.statRow}>
                    <span>{digimon.stage}</span>
                    <span>{digimon.type}</span>
                  </p>
                  <ProgressBar label="Scan" value={scanValue} max={SCAN_MAX} />
                  {hasBonusScanTier(scanValue) && (
                    <p className={styles.dexText}>
                      +{Math.round(getScanBonusRatio(scanValue) * 100)}% stat bonus if recruited now!
                    </p>
                  )}
                  {canRecruit && (
                    <Button onClick={() => recruitFromScan(digimon.id, digimon.baseStats)}>
                      Recruit ({Math.round(scanValue)}% scanned)
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

