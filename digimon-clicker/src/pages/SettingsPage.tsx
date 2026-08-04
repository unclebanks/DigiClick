import { Card } from '../components/common/Card'
import styles from '../styles/pages.module.css'

export function SettingsPage() {
  return (
    <div className={styles.page}>
      <Card title="Settings">
        <p>Placeholder for sound, save preferences, and display options.</p>
      </Card>
    </div>
  )
}
