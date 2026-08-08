import { Sword } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { ProgressBar } from '../components/common/ProgressBar'
import { useGameStore } from '../store/gameStore'
import { sampleDigimon } from '../data/digimon'
import { battleRoutesByRegion, sampleBattleRoutes } from '../data/areas'
import { getDefaultBattleRoute, getEncounterLevel, isRouteUnlocked, pickRandomEncounterId } from '../utils/battleRoutes'
import { getAttackIntervalMs, resolveAttack, resolveVictoryRewards } from '../utils/combat'
import type { CombatantState } from '../utils/combat'
import { describeAttributeMatchup } from '../utils/digimonAttributes'
import { calculateDigimonStats } from '../utils/digimonStats'
import { resolveDigimonProgression } from '../utils/digimonProgression'
import { createInitialDigivolutionState } from '../utils/evolution'
import { SCAN_RECRUIT_THRESHOLD, getScanGainFromDefeat } from '../utils/scanning'
import styles from '../styles/pages.module.css'

export function BattlePage() {
  const [activeRouteId, setActiveRouteId] = useState(getDefaultBattleRoute(sampleBattleRoutes).id)
  const [selectedRegion, setSelectedRegion] = useState('Region 1')
  const [enemyHp, setEnemyHp] = useState(0)
  const [partyHp, setPartyHp] = useState<Record<string, number>>({})
  const [activeMemberIndex, setActiveMemberIndex] = useState(0)
  const [isBattling, setIsBattling] = useState(true)
  const [logEntries, setLogEntries] = useState<string[]>(['Select a route and challenge the wild Digimon ahead.'])

  const addCurrency = useGameStore((state) => state.addCurrency)
  const addInventoryItem = useGameStore((state) => state.addInventoryItem)
  const gainDigimonExperience = useGameStore((state) => state.gainDigimonExperience)
  const playerLevel = useGameStore((state) => state.playerLevel)
  const partyDigimon = useGameStore((state) => state.partyDigimon)
  const digimonProgression = useGameStore((state) => state.digimonProgression)
  const digivolutionStates = useGameStore((state) => state.digivolutionStates)
  const digimonBonuses = useGameStore((state) => state.digimonBonuses)
  const scanProgress = useGameStore((state) => state.scanProgress)
  const recordBattleEncounter = useGameStore((state) => state.recordBattleEncounter)
  const recordCombatEvent = useGameStore((state) => state.recordCombatEvent)
  const recordVictory = useGameStore((state) => state.recordVictory)
  const unlockBadge = useGameStore((state) => state.unlockBadge)
  const gainScanProgress = useGameStore((state) => state.gainScanProgress)
  const recruitFromScan = useGameStore((state) => state.recruitFromScan)

  const currentRoute = useMemo(
    () => sampleBattleRoutes.find((route) => route.id === activeRouteId) ?? getDefaultBattleRoute(sampleBattleRoutes),
    [activeRouteId],
  )

  const availableRoutes = useMemo(() => battleRoutesByRegion[selectedRegion] ?? [], [selectedRegion])
  const encounterLevel = useMemo(() => getEncounterLevel(currentRoute, playerLevel), [currentRoute, playerLevel])

  // Re-rolled whenever a new route is entered or the current wild Digimon is defeated.
  const [encounterSpeciesId, setEncounterSpeciesId] = useState(() => pickRandomEncounterId(currentRoute))
  const [lastRouteId, setLastRouteId] = useState(currentRoute.id)

  if (currentRoute.id !== lastRouteId) {
    setLastRouteId(currentRoute.id)
    setEncounterSpeciesId(pickRandomEncounterId(currentRoute))
  }

  const activeEncounter = useMemo(() => {
    const species = sampleDigimon.find((digimon) => digimon.id === encounterSpeciesId)

    return species ? { ...species, level: Math.max(species.level, encounterLevel) } : undefined
  }, [encounterSpeciesId, encounterLevel])

  const enemyStats = useMemo(
    () => (activeEncounter ? calculateDigimonStats(activeEncounter.baseStats, activeEncounter.level) : null),
    [activeEncounter],
  )

  const activeMemberId = partyDigimon[activeMemberIndex]

  const activeMember = useMemo(() => {
    if (!activeMemberId) {
      return undefined
    }

    const digivolutionState = digivolutionStates[activeMemberId] ?? createInitialDigivolutionState(activeMemberId)
    const species = sampleDigimon.find((digimon) => digimon.id === digivolutionState.currentFormId)

    if (!species) {
      return undefined
    }

    const progression = resolveDigimonProgression(digimonProgression[activeMemberId])
    const bonus = digimonBonuses[activeMemberId]
    const stats = calculateDigimonStats(species.baseStats, progression.level, {
      statMultiplier: digivolutionState.penaltyMultiplier,
      attackBonus: bonus?.attack,
      defenseBonus: bonus?.defense,
      speedBonus: bonus?.speed,
      hpBonus: bonus?.hp,
    })

    return { baseId: activeMemberId, species, progression, stats }
  }, [activeMemberId, digivolutionStates, digimonProgression, digimonBonuses])

  const activeMemberHp = activeMember ? partyHp[activeMember.baseId] ?? activeMember.stats.hp : 0
  const scanValue = activeEncounter ? scanProgress[activeEncounter.id] ?? 0 : 0
  const canRecruit = scanValue >= SCAN_RECRUIT_THRESHOLD

  const appendLog = (message: string) => {
    setLogEntries((previous) => [message, ...previous].slice(0, 5))
  }

  // Reset the wild Digimon's health whenever a new encounter or route is selected. This follows
  // React's "adjusting state during render" pattern instead of a setState-in-effect side effect.
  const encounterKey = `${activeEncounter?.id ?? 'none'}-${currentRoute.id}`
  const [lastEncounterKey, setLastEncounterKey] = useState(encounterKey)

  if (encounterKey !== lastEncounterKey) {
    setLastEncounterKey(encounterKey)
    setEnemyHp(enemyStats ? enemyStats.hp : 0)
  }

  useEffect(() => {
    if (activeEncounter) {
      recordBattleEncounter(activeEncounter.id)
    }
    // Only fire once per distinct encounter species, not on every level recalculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEncounter?.id])

  const handleEnemyDefeated = () => {
    if (!activeMember || !activeEncounter || !enemyStats) {
      return
    }

    const enemyCombatant: CombatantState = {
      id: activeEncounter.id,
      name: activeEncounter.name,
      hp: 0,
      maxHp: enemyStats.hp,
      attack: enemyStats.attack,
      defense: enemyStats.defense,
      speed: enemyStats.speed,
      level: activeEncounter.level,
      attribute: activeEncounter.type,
      drops: activeEncounter.drops,
    }

    const rewards = resolveVictoryRewards(enemyCombatant)

    addCurrency(rewards.bits)
    gainDigimonExperience(activeMember.baseId, rewards.exp)
    recordVictory({ bits: rewards.bits, exp: rewards.exp })
    gainScanProgress(activeEncounter.id, getScanGainFromDefeat(activeEncounter.level))
    rewards.droppedItemIds.forEach((itemId) => addInventoryItem(itemId))
    unlockBadge('first-victory')
    unlockBadge(`cleared-${currentRoute.id}`)

    const lootNote = rewards.droppedItemIds.length ? ` Found: ${rewards.droppedItemIds.join(', ')}.` : ''
    appendLog(`Victory! ${activeEncounter.name} fell. You earned ${rewards.bits} Bits and ${rewards.exp} EXP.${lootNote}`)
    // Reset hp in case the reroll below happens to pick the same species again; the encounterKey
    // check further down catches the case where a different species is rolled.
    setEnemyHp(enemyStats.hp)
    setEncounterSpeciesId(pickRandomEncounterId(currentRoute))
  }

  const handlePartyMemberFainted = () => {
    if (!activeMember) {
      return
    }

    const isAlive = (id: string) => (partyHp[id] ?? 1) > 0
    const order = [...partyDigimon.slice(activeMemberIndex + 1), ...partyDigimon.slice(0, activeMemberIndex + 1)]
    const nextAliveId = order.find((id) => id !== activeMember.baseId && isAlive(id))

    if (nextAliveId) {
      setActiveMemberIndex(partyDigimon.indexOf(nextAliveId))
      appendLog(`${activeMember.species.name} fainted! Sending out the next Digimon.`)
      return
    }

    setIsBattling(false)
    appendLog(`${activeMember.species.name} fainted! Your team needs to regroup before battling again.`)
  }

  const performAttackRef = useRef<((side: 'player' | 'enemy') => void) | undefined>(undefined)

  const performAttack = (side: 'player' | 'enemy') => {
    if (!activeMember || !activeEncounter || !enemyStats) {
      return
    }

    const playerCombatant: CombatantState = {
      id: activeMember.baseId,
      name: activeMember.species.name,
      hp: activeMemberHp,
      maxHp: activeMember.stats.hp,
      attack: activeMember.stats.attack,
      defense: activeMember.stats.defense,
      speed: activeMember.stats.speed,
      level: activeMember.progression.level,
      attribute: activeMember.species.type,
    }

    const enemyCombatant: CombatantState = {
      id: activeEncounter.id,
      name: activeEncounter.name,
      hp: enemyHp,
      maxHp: enemyStats.hp,
      attack: enemyStats.attack,
      defense: enemyStats.defense,
      speed: enemyStats.speed,
      level: activeEncounter.level,
      attribute: activeEncounter.type,
      drops: activeEncounter.drops,
    }

    const attacker = side === 'player' ? playerCombatant : enemyCombatant
    const defender = side === 'player' ? enemyCombatant : playerCombatant
    const outcome = resolveAttack(attacker, defender)
    const flavorNote = outcome.isMiss
      ? ' It missed!'
      : outcome.isCritical
        ? ' Critical hit!'
        : ''
    const attributeNote = outcome.isMiss ? '' : ` ${describeAttributeMatchup(attacker.attribute, defender.attribute)}`

    recordCombatEvent({
      isCritical: outcome.isCritical,
      isMiss: outcome.isMiss,
      damageDealt: side === 'player' ? outcome.damage : 0,
      damageTaken: side === 'enemy' ? outcome.damage : 0,
    })

    if (side === 'player') {
      setEnemyHp(outcome.defenderHp)
      appendLog(`${attacker.name} hit ${defender.name} for ${outcome.damage} damage.${flavorNote}${attributeNote}`.trim())

      if (outcome.defenderDefeated) {
        handleEnemyDefeated()
      }
    } else {
      setPartyHp((previous) => ({ ...previous, [activeMember.baseId]: outcome.defenderHp }))
      appendLog(`${attacker.name} hit ${defender.name} for ${outcome.damage} damage.${flavorNote}${attributeNote}`.trim())

      if (outcome.defenderDefeated) {
        handlePartyMemberFainted()
      }
    }
  }

  // Keep the ref pointed at the latest closure so the intervals below always act on fresh state.
  useEffect(() => {
    performAttackRef.current = performAttack
  })

  useEffect(() => {
    if (!isBattling || !activeMember || !activeEncounter || !enemyStats) {
      return
    }

    const playerIntervalMs = getAttackIntervalMs(activeMember.stats.speed)
    const enemyIntervalMs = getAttackIntervalMs(enemyStats.speed)

    const playerTimer = window.setInterval(() => performAttackRef.current?.('player'), playerIntervalMs)
    const enemyTimer = window.setInterval(() => performAttackRef.current?.('enemy'), enemyIntervalMs)

    return () => {
      window.clearInterval(playerTimer)
      window.clearInterval(enemyTimer)
    }
    // Intervals are only re-created when the battler or its speed actually changes, not on
    // every render; performAttackRef always calls into the freshest attack logic regardless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBattling, activeMember?.baseId, activeMember?.stats.speed, activeEncounter?.id, enemyStats?.speed])

  const handleRegroup = () => {
    setPartyHp({})
    setActiveMemberIndex(0)
    setIsBattling(true)
    appendLog('Your team rests and returns to the fight.')
  }

  const handleRecruit = () => {
    if (!activeEncounter) {
      return
    }

    const recruited = recruitFromScan(activeEncounter.id, activeEncounter.baseStats)
    appendLog(recruited
      ? `${activeEncounter.name} was recruited to your Digital Space!`
      : `${activeEncounter.name} could not be recruited right now.`)
  }

  const handleRouteSelect = (routeId: string) => {
    const nextRoute = sampleBattleRoutes.find((route) => route.id === routeId)

    if (!nextRoute || !isRouteUnlocked(nextRoute, playerLevel)) {
      appendLog('That route is still locked. Train a little more and build your party.')
      return
    }

    setActiveRouteId(routeId)
    appendLog(`You entered ${nextRoute.region} - ${nextRoute.name}.`)
  }

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    const firstRoute = battleRoutesByRegion[region]?.[0]

    if (firstRoute) {
      setActiveRouteId(firstRoute.id)
      appendLog(`You opened ${region}. Select a route to begin.`)
    }
  }

  return (
    <div className={styles.page}>
      <Card title="Battle Routes">
        <div className={styles.battlePanel}>
          <div className={styles.battleRoster}>
            <div className={styles.battleCombatant}>
              <p className={styles.eyebrow}>Wild Digimon</p>
              <h2>{activeEncounter?.name ?? 'No encounter'}</h2>
              <p>{currentRoute.region} • {currentRoute.name}</p>
              <p>Lv. {activeEncounter?.level ?? 1} • {activeEncounter?.type ?? 'Free'}</p>
              <ProgressBar label="HP" value={enemyStats ? Math.round((enemyHp / enemyStats.hp) * 100) : 0} />
              <ProgressBar label="Scan" value={Math.min(100, scanValue)} />
              <p className={styles.statRow}>
                <span>ATK {enemyStats?.attack ?? 0}</span>
                <span>DEF {enemyStats?.defense ?? 0}</span>
                <span>SPD {enemyStats?.speed ?? 0}</span>
              </p>
              <p>{currentRoute.description}</p>
              {canRecruit && (
                <Button variant="secondary" onClick={handleRecruit}>
                  Recruit ({scanValue}% scanned)
                </Button>
              )}
            </div>

            <div className={styles.battleCombatant}>
              <p className={styles.eyebrow}>Your Digimon</p>
              <h2>{activeMember?.species.name ?? 'No party Digimon'}</h2>
              <p>Lv. {activeMember?.progression.level ?? 1} • {activeMember?.species.type ?? 'Free'}</p>
              <ProgressBar label="HP" value={activeMember ? Math.round((activeMemberHp / activeMember.stats.hp) * 100) : 0} />
              <ProgressBar
                label="EXP"
                value={activeMember ? Math.round((activeMember.progression.exp / activeMember.progression.expToNextLevel) * 100) : 0}
              />
              <p className={styles.statRow}>
                <span>ATK {activeMember?.stats.attack ?? 0}</span>
                <span>DEF {activeMember?.stats.defense ?? 0}</span>
                <span>SPD {activeMember?.stats.speed ?? 0}</span>
              </p>
              {!isBattling && (
                <Button onClick={handleRegroup}>Regroup</Button>
              )}
            </div>
          </div>

          <div className={styles.battleControls}>
            <label className={styles.eyebrow} htmlFor="region-select">
              Region
            </label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(event) => handleRegionSelect(event.target.value)}
            >
              {Object.keys(battleRoutesByRegion).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <div className={styles.routeList}>
              {availableRoutes.map((route) => (
                <Button
                  key={route.id}
                  variant={route.id === currentRoute.id ? 'primary' : 'secondary'}
                  onClick={() => handleRouteSelect(route.id)}
                >
                  {route.name}
                </Button>
              ))}
            </div>
            <p className={styles.eyebrow}>
              <Sword size={16} /> {isBattling ? 'Auto-battle in progress' : 'Battle paused'}
            </p>
            <ul className={styles.logList}>
              {logEntries.map((entry, index) => (
                <li key={index}>{entry}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

