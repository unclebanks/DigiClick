export function getLevelProgress(currentLevel: number, currency: number): number {
  const normalizedCurrency = Math.max(0, currency)
  const progress = Math.round((normalizedCurrency % 1000) / 10)
  const milestoneBonus = Math.min(100, Math.floor(normalizedCurrency / 1000) * 20)

  return Math.min(100, Math.max(0, progress + currentLevel * 2 + milestoneBonus))
}
