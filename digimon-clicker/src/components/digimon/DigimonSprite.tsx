import { useEffect, useState } from 'react'
import { getDigimonSpriteFrames } from '../../utils/sprites'
import { getSpriteFacing, type SpriteFacing } from '../../data/spriteFacing'
import styles from './DigimonSprite.module.css'

const FRAME_INTERVAL_MS = 350

interface DigimonSpriteProps {
  speciesId: string
  name: string
  // Emoji placeholder shown whenever no sprite art exists yet for this species.
  emoji: string
  // Which way this sprite should visually face on screen - omit to use its native art direction.
  // Pass the opposite of its native facing (data/spriteFacing.ts) to flip it, e.g. so two
  // combatants face each other in a battle scene.
  facing?: SpriteFacing
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function DigimonSprite({ speciesId, name, emoji, facing, size = 'medium', className }: DigimonSpriteProps) {
  const frames = getDigimonSpriteFrames(speciesId)
  const [frameIndex, setFrameIndex] = useState(0)
  // Tracks which species the current frameIndex belongs to, so switching species (e.g. a new wild
  // encounter) resets the animation back to frame 0 instead of continuing mid-cycle.
  const [trackedSpeciesId, setTrackedSpeciesId] = useState(speciesId)

  if (speciesId !== trackedSpeciesId) {
    setTrackedSpeciesId(speciesId)
    setFrameIndex(0)
  }

  // Cycles through the frames on an interval to imitate movement.
  useEffect(() => {
    if (!frames || frames.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length)
    }, FRAME_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [frames])

  if (!frames) {
    return (
      <div className={[styles.spriteFallback, styles[size], className].filter(Boolean).join(' ')} role="img" aria-label={name}>
        {emoji}
      </div>
    )
  }

  const shouldFlip = facing !== undefined && facing !== getSpriteFacing(speciesId)

  return (
    <img
      className={[styles.sprite, styles[size], shouldFlip ? styles.flipped : '', className].filter(Boolean).join(' ')}
      src={frames[frameIndex]}
      alt={name}
    />
  )
}
