import styles from './Card.module.css'

interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <section className={styles.card}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  )
}
