import styles from './Button.module.css'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ children, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${variant === 'secondary' ? styles.secondary : styles.primary}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
