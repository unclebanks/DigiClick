import styles from './Button.module.css'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${variant === 'secondary' ? styles.secondary : styles.primary}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
