import { Card } from '../components/common/Card'
import styles from '../styles/pages.module.css'

export function DigiDexPage() {
  return (
    <div className={styles.page}>
      <Card title="DigiDex">
        <p>Use this area for future collection tracking, rarity data, and evolution milestones.</p>
      </Card>
    </div>
  )
}
