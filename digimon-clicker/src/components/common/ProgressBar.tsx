import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  label: string
  value: number
  // Values above 100 (e.g. scan progress up to 200%) render as a second, green segment past
  // the normal blue fill instead of being clamped away.
  max?: number
  // Point past which the fill switches to the overflow color - defaults to `max` (no overflow
  // segment). Scan bars pass SCAN_RECRUIT_THRESHOLD here since their bonus tier runs past 100
  // while their own max is 200.
  overflowThreshold?: number
  // Shown instead of the default "{value}%" text, e.g. "320/600" for an HP bar.
  displayValue?: string
}

export function ProgressBar({ label, value, max = 100, overflowThreshold = max, displayValue }: ProgressBarProps) {
  const clampedValue = Math.min(max, Math.max(0, value))
  const baseCap = Math.min(overflowThreshold, max)
  const baseWidth = (Math.min(clampedValue, baseCap) / max) * 100
  const overflowWidth = clampedValue > baseCap ? ((clampedValue - baseCap) / max) * 100 : 0

  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <span>{label}</span>
        <span>{displayValue ?? `${Math.round(clampedValue)}%`}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${baseWidth}%` }} />
        {overflowWidth > 0 && <div className={styles.overflowFill} style={{ width: `${overflowWidth}%` }} />}
      </div>
    </div>
  )
}
