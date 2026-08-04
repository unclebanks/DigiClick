import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  label: string
  value: number
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.meta}>
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
