import { useRef, useState } from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { useGameStore } from '../store/gameStore'
import { deleteSaveGame, hasSaveGame } from '../utils/saveGame'
import type { ThemeName } from '../types/game'
import styles from '../styles/pages.module.css'

const THEME_OPTIONS: Array<{ value: ThemeName, label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'dark-high-contrast', label: 'Dark (High Contrast)' },
]

export function SettingsPage() {
  const theme = useGameStore((state) => state.theme)
  const setTheme = useGameStore((state) => state.setTheme)
  const saveToStorage = useGameStore((state) => state.saveToStorage)
  const importSaveFile = useGameStore((state) => state.importSaveFile)
  const exportSaveFile = useGameStore((state) => state.exportSaveFile)
  const lastSavedAt = useGameStore((state) => state.lastSavedAt)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const success = saveToStorage()
    setStatusMessage(success ? 'Game saved!' : 'Could not save - storage may be unavailable or full.')
  }

  const handleExport = () => {
    const contents = exportSaveFile()
    const blob = new Blob([contents], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    link.href = url
    link.download = `digiclick-save-${timestamp}.json`
    link.click()
    URL.revokeObjectURL(url)

    setStatusMessage('Save file exported.')
  }

  // "Load Game" opens a file picker so the player can load a previously exported save file.
  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const success = importSaveFile(typeof reader.result === 'string' ? reader.result : '')
      setStatusMessage(success ? 'Save loaded from file!' : 'That file is not a valid DigiClick save.')
    }

    reader.onerror = () => {
      setStatusMessage('Could not read that file.')
    }

    reader.readAsText(file)
  }

  const handleDelete = () => {
    if (!hasSaveGame()) {
      setStatusMessage('There is no save file to delete.')
      return
    }

    const confirmed = window.confirm('Delete your save file? This cannot be undone.')

    if (!confirmed) {
      return
    }

    deleteSaveGame()
    setStatusMessage('Save file deleted. Your current session is unaffected until you reload the page.')
  }

  return (
    <div className={styles.page}>
      <Card title="Themes">
        <p>Choose a color theme for the whole app. Your choice is saved with your game.</p>
        <div className={styles.actions} role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={theme === option.value ? 'primary' : 'secondary'}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
              {theme === option.value ? ' ✓' : ''}
            </Button>
          ))}
        </div>
      </Card>
      <Card title="Settings">
        <p>Placeholder for sound options.</p>
      </Card>
      <Card title="Save Data">
        <p>
          {lastSavedAt
            ? `Last saved: ${new Date(lastSavedAt).toLocaleString()}`
            : 'No save has been made yet this session.'}
        </p>
        <div className={styles.actions}>
          <Button onClick={handleSave}>Save Game</Button>
          <Button variant="secondary" onClick={handleExport}>Export Save</Button>
          <Button variant="secondary" onClick={handleLoad}>Load Game</Button>
          <Button variant="secondary" onClick={handleDelete}>Delete Save</Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          style={{ display: 'none' }}
        />
        {statusMessage && <p role="status">{statusMessage}</p>}
      </Card>
    </div>
  )
}
